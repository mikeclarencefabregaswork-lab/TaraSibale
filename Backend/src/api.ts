import express, {
  Router,
  type Request,
  type Response,
  type NextFunction,
} from "express";
import { createHash, randomBytes, randomUUID } from "node:crypto";
import type { Pool, PoolClient } from "pg";
import { rateLimit } from "express-rate-limit";
import { z, ZodError } from "zod";
import { hashPassword, verifyPassword } from "./auth.js";
import * as v from "./validation.js";
import { createPublishingLimit } from "./publishing.js";

interface UserRow {
  id: string;
  name: string;
  email: string;
  role: string;
  is_verified: boolean;
  created_at: Date;
  password_hash: string;
}
class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
const cookieName = "tarasibale_session";
const digest = (token: string) =>
  createHash("sha256").update(token).digest("hex");
const tokenFrom = (request: Request) =>
  request.headers.cookie
    ?.split(";")
    .map((value) => value.trim())
    .find((value) => value.startsWith(cookieName + "="))
    ?.slice(cookieName.length + 1);
const userFrom = (response: Response) => response.locals.user as UserRow;
const profile = (user: UserRow) => ({
  id: user.id,
  name: user.name,
  shortName: user.name.split(/\s+/)[0],
  email: user.email,
  role: user.role,
  initials: user.name
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase(),
  badge:
    user.role === "admin"
      ? "Tourism Administrator"
      : user.is_verified
        ? `Verified ${user.role}`
        : `${user.role} · Verification pending`,
  isVerified: user.is_verified,
  joinedDate: new Date(user.created_at).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  }),
});
const defaults = {
  enableGroupChat: true,
  enableHomestayBooking: true,
  enableCloudVault: true,
  enablePublicReviews: true,
  enableSocialCommunityStream: true,
  enableAiConcierge: true,
  allowOnlyVerifiedGuidesToMessage: false,
  allowOnlyVerifiedHostsToAcceptBookings: false,
  requireLoginForReviews: true,
  maintenanceMode: false,
};

async function transaction<T>(
  pool: Pool,
  action: (client: PoolClient) => Promise<T>,
): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await action(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export function createApi(pool: Pool) {
  const api = Router();
  api.use(express.json({ limit: "6mb" }));
  api.use((_request, response, next) => {
    response.setHeader("Cache-Control", "no-store");
    next();
  });
  api.use((request, _response, next) => {
    if (!["GET", "HEAD", "OPTIONS"].includes(request.method)) {
      const origin = request.headers.origin;
      const allowed = new Set([
        `http://${request.headers.host}`,
        `https://${request.headers.host}`,
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:4173",
        "http://127.0.0.1:4173",
        ...(process.env.APP_ORIGIN ? [process.env.APP_ORIGIN] : []),
      ]);
      if (
        request.headers["sec-fetch-site"] === "cross-site" ||
        (origin && !allowed.has(origin))
      )
        return next(new ApiError(403, "Cross-site requests are not allowed"));
    }
    next();
  });
  api.use(async (request, response, next) => {
    const token = tokenFrom(request);
    if (token && /^[0-9a-f]{64}$/.test(token)) {
      const result = await pool.query<UserRow>(
        "SELECT u.* FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token_hash=$1 AND s.expires_at>now()",
        [digest(token)],
      );
      response.locals.user = result.rows[0];
    }
    next();
  });
  const requireUser = (
    _request: Request,
    response: Response,
    next: NextFunction,
  ) => {
    if (!response.locals.user)
      return next(new ApiError(401, "Please sign in to continue"));
    next();
  };
  const requireAdmin = (
    _request: Request,
    response: Response,
    next: NextFunction,
  ) => {
    if (userFrom(response).role !== "admin")
      return next(new ApiError(403, "Administrator access is required"));
    next();
  };
  async function settings() {
    const result = await pool.query("SELECT data FROM settings WHERE key=$1", [
      "permissions",
    ]);
    return v.permissions.parse(result.rows[0]?.data ?? defaults);
  }
  async function feature(key: keyof typeof defaults) {
    const permissions = await settings();
    if (permissions.maintenanceMode || !permissions[key])
      throw new ApiError(403, "This feature is currently unavailable");
    return permissions;
  }
  async function issueSession(
    request: Request,
    response: Response,
    user: UserRow,
    remember = false,
  ) {
    const token = randomBytes(32).toString("hex");
    const milliseconds = (remember ? 30 : 1) * 24 * 60 * 60 * 1000;
    const oldToken = tokenFrom(request);
    await transaction(pool, async (client) => {
      if (oldToken && /^[0-9a-f]{64}$/.test(oldToken))
        await client.query("DELETE FROM sessions WHERE token_hash=$1", [
          digest(oldToken),
        ]);
      await client.query("DELETE FROM sessions WHERE expires_at<now()");
      await client.query(
        "INSERT INTO sessions(token_hash,user_id,expires_at) VALUES($1,$2,$3)",
        [digest(token), user.id, new Date(Date.now() + milliseconds)],
      );
    });
    response.cookie(cookieName, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/api",
      ...(remember ? { maxAge: milliseconds } : {}),
    });
  }
  const authLimit = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 30,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { error: "Too many sign-in attempts. Please try again later." },
  });
  const publishingLimit = createPublishingLimit();
  api.get("/auth/me", (_request, response) => {
    response.json(response.locals.user ? profile(userFrom(response)) : null);
  });
  api.post("/auth/signup", authLimit, async (request, response) => {
    const input = v.signup.parse(request.body);
    const hash = await hashPassword(input.password);
    const result = await transaction(pool, async (client) => {
      const inserted = await client.query<UserRow>(
        "INSERT INTO users(email,name,password_hash,role) VALUES($1,$2,$3,$4) RETURNING *",
        [input.email, input.name, hash, input.role],
      );
      const user = inserted.rows[0]!;
      await client.query("INSERT INTO user_state(user_id) VALUES($1)", [
        user.id,
      ]);
      if (input.role !== "traveler") {
        const application = {
          id: randomUUID(),
          userId: user.id,
          fullName: user.name,
          email: user.email,
          phone: "Not provided",
          appliedRole: input.role,
          businessOrTitleName: "Profile verification",
          barangay: "Not provided",
          documentType: "Not submitted",
          documentSummary:
            "Contact the tourism administrator to provide supporting verification documents.",
          status: "PENDING",
          submittedAt: new Date().toISOString().slice(0, 10),
        };
        await client.query(
          "INSERT INTO verifications(id,user_id,data) VALUES($1,$2,$3)",
          [application.id, user.id, application],
        );
      }
      await client.query(
        "INSERT INTO group_members(group_id,user_id) SELECT id,$1 FROM travel_groups WHERE id='group-101' ON CONFLICT DO NOTHING",
        [user.id],
      );
      return user;
    });
    await issueSession(request, response, result);
    response.status(201).json(profile(result));
  });
  let dummyHash: Promise<string> | undefined;
  api.post("/auth/login", authLimit, async (request, response) => {
    const input = v.login.parse(request.body);
    const result = await pool.query<UserRow>(
      "SELECT * FROM users WHERE lower(email)=$1",
      [input.email],
    );
    const user = result.rows[0];
    dummyHash ??= hashPassword(randomBytes(32).toString("hex"));
    const valid = await verifyPassword(
      input.password,
      user?.password_hash ?? (await dummyHash),
    );
    if (!user || !valid)
      throw new ApiError(401, "Email or password is incorrect");
    await issueSession(request, response, user, input.rememberMe);
    response.json(profile(user));
  });
  api.post("/auth/logout", async (request, response) => {
    const token = tokenFrom(request);
    if (token && /^[0-9a-f]{64}$/.test(token))
      await pool.query("DELETE FROM sessions WHERE token_hash=$1", [
        digest(token),
      ]);
    response.clearCookie(cookieName, {
      path: "/api",
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
    response.sendStatus(204);
  });
  async function socialPosts(userId?: string) {
    const rows = await pool.query(
      `SELECT p.data, (SELECT count(*)::int FROM social_likes l WHERE l.post_id=p.id) AS likes,
      EXISTS(SELECT 1 FROM social_likes l WHERE l.post_id=p.id AND l.user_id=$1) AS liked FROM social_posts p ORDER BY p.created_at DESC LIMIT 200`,
      [userId ?? null],
    );
    return rows.rows.map((row) => ({
      ...row.data,
      likes: row.likes,
      userLiked: row.liked,
    }));
  }
  api.get("/catalog", async (_request, response) => {
    const [resources, permissions, posts, ratings] = await Promise.all([
      pool.query(
        "SELECT id,kind,data FROM resources WHERE data->>'isArchived' IS DISTINCT FROM 'true' ORDER BY id",
      ),
      settings(),
      socialPosts(response.locals.user?.id),
      pool.query(
        "SELECT target_id,count(*)::int AS count,round(avg((data->>'rating')::numeric),1)::float8 AS rating FROM reviews GROUP BY target_id",
      ),
    ]);
    const grouped: Record<string, unknown[]> = {
      attraction: [],
      accommodation: [],
      ferry: [],
      culture: [],
      trail: [],
    };
    const ratingMap = new Map(ratings.rows.map((row) => [row.target_id, row]));
    for (const row of resources.rows) {
      const stats = ratingMap.get(row.id);
      grouped[row.kind]?.push(
        ["attraction", "accommodation"].includes(row.kind)
          ? {
              ...row.data,
              rating: stats?.rating ?? 0,
              reviewCount: stats?.count ?? 0,
            }
          : row.data,
      );
    }
    response.json({
      attractions: grouped.attraction,
      accommodations: grouped.accommodation,
      ferryRoutes: grouped.ferry,
      cultureItems: grouped.culture,
      hikingTrails: grouped.trail,
      systemPermissions: permissions,
      socialPosts: posts,
    });
  });
  const readBookings = async (id: string) =>
    (
      await pool.query(
        "SELECT data FROM bookings WHERE user_id=$1 ORDER BY created_at DESC LIMIT 500",
        [id],
      )
    ).rows.map((row) => row.data);
  const readMessages = async (id: string, groupId?: string) =>
    (
      await pool.query(
        "SELECT m.data FROM messages m JOIN group_members gm ON gm.group_id=m.group_id WHERE gm.user_id=$1 AND ($2::text IS NULL OR m.group_id=$2) ORDER BY m.created_at DESC LIMIT 200",
        [id, groupId ?? null],
      )
    ).rows
      .reverse()
      .map((row) => row.data);
  api.get("/bootstrap", requireUser, async (_request, response) => {
    const user = userFrom(response);
    const [state, bookings, messages, applicants] = await Promise.all([
      pool.query(
        "SELECT notifications,documents,itinerary,checklists FROM user_state WHERE user_id=$1",
        [user.id],
      ),
      readBookings(user.id),
      readMessages(user.id),
      user.role === "admin"
        ? pool.query(
            "SELECT data FROM verifications ORDER BY created_at DESC LIMIT 1000",
          )
        : Promise.resolve({ rows: [] }),
    ]);
    response.json({
      user: profile(user),
      bookings,
      groupMessages: messages,
      verificationApplicants: applicants.rows.map((row) => row.data),
      notifications: [],
      documents: [],
      itinerary: [],
      checklists: {},
      ...state.rows[0],
    });
  });
  api.put("/user-state", requireUser, async (request, response) => {
    const expectedUserId = request.get("X-TaraSibale-User-Id");
    if (
      expectedUserId !== undefined &&
      expectedUserId !== userFrom(response).id
    ) {
      throw new ApiError(
        409,
        "Your signed-in account changed in another tab. Reload before saving.",
      );
    }
    const input = v.userState.parse(request.body);
    if (input.documents !== undefined) await feature("enableCloudVault");
    const fields = [
      "notifications",
      "documents",
      "itinerary",
      "checklists",
    ] as const;
    await transaction(pool, async (client) => {
      await client.query(
        "INSERT INTO user_state(user_id) VALUES($1) ON CONFLICT DO NOTHING",
        [userFrom(response).id],
      );
      for (const field of fields) {
        if (input[field] !== undefined)
          await client.query(
            `UPDATE user_state SET ${field}=$1,updated_at=now() WHERE user_id=$2`,
            [JSON.stringify(input[field]), userFrom(response).id],
          );
      }
    });
    response.json({ status: "ok" });
  });
  api.get("/reviews", async (_request, response) => {
    const rows = await pool.query(
      "SELECT r.data,(SELECT count(*)::int FROM review_votes v WHERE v.review_id=r.id) AS votes FROM reviews r ORDER BY r.created_at DESC LIMIT 500",
    );
    response.json(
      rows.rows.map((row) => ({ ...row.data, helpfulCount: row.votes })),
    );
  });
  api.post(
    "/reviews",
    requireUser,
    publishingLimit,
    async (request, response) => {
      await feature("enablePublicReviews");
      const input = v.review.parse(request.body);
      const target = await pool.query(
        "SELECT id FROM resources WHERE id=$1 AND kind IN ('attraction','accommodation') AND data->>'isArchived' IS DISTINCT FROM 'true'",
        [input.targetId],
      );
      if (!target.rowCount)
        throw new ApiError(404, "Review target does not exist");
      const user = userFrom(response);
      const data = {
        ...input,
        id: randomUUID(),
        author: user.name,
        avatar: "/tarasibale-logo.png",
        date: new Date().toISOString().slice(0, 10),
        helpfulCount: 0,
      };
      await pool.query(
        "INSERT INTO reviews(id,target_id,user_id,data) VALUES($1,$2,$3,$4)",
        [data.id, data.targetId, user.id, data],
      );
      response.status(201).json(data);
    },
  );
  api.post("/reviews/:id/helpful", requireUser, async (request, response) => {
    await feature("enablePublicReviews");
    await pool.query(
      "INSERT INTO review_votes(review_id,user_id) VALUES($1,$2) ON CONFLICT DO NOTHING",
      [request.params.id, userFrom(response).id],
    );
    const result = await pool.query(
      "SELECT count(*)::int AS count FROM review_votes WHERE review_id=$1",
      [request.params.id],
    );
    const review = await pool.query("SELECT data FROM reviews WHERE id=$1", [
      request.params.id,
    ]);
    response.json({
      ...review.rows[0].data,
      helpfulCount: result.rows[0].count,
    });
  });
  api.get("/bookings", requireUser, async (_request, response) => {
    response.json(await readBookings(userFrom(response).id));
  });
  api.post("/bookings", requireUser, async (request, response) => {
    const permissions = await feature("enableHomestayBooking");
    const input = v.booking.parse(request.body);
    const result = await transaction(pool, async (client) => {
      const target = await client.query(
        "SELECT data FROM resources WHERE id=$1 AND kind='accommodation' AND data->>'isArchived' IS DISTINCT FROM 'true' FOR UPDATE",
        [input.accommodationId],
      );
      if (!target.rowCount)
        throw new ApiError(404, "Accommodation does not exist");
      const stay = target.rows[0].data;
      if (
        stay.bookingMode === "reference-only" ||
        stay.pricePerNight == null ||
        stay.maxGuests == null ||
        !stay.roomTypes.length
      )
        throw new ApiError(
          409,
          "Online booking is not enabled for this listing. Confirm current details locally.",
        );
      if (
        input.guestsCount > stay.maxGuests ||
        !stay.roomTypes.includes(input.roomType)
      )
        throw new ApiError(
          400,
          "Please choose a valid room type and guest count",
        );
      if (
        permissions.allowOnlyVerifiedHostsToAcceptBookings &&
        !stay.isVerifiedPartner
      )
        throw new ApiError(
          403,
          "This accommodation is awaiting host verification",
        );
      if (["FULLY_BOOKED", "MAINTENANCE"].includes(stay.availabilityStatus))
        throw new ApiError(409, "This accommodation is unavailable");
      const nights =
        (Date.parse(input.checkOut) - Date.parse(input.checkIn)) / 86400000;
      if (nights > 365)
        throw new ApiError(400, "Bookings cannot exceed 365 nights");
      const count = await client.query(
        `SELECT COALESCE(max(occupied),0)::int AS count FROM (
        SELECT n.day,count(b.id) AS occupied
        FROM generate_series($2::date,$3::date-1,interval '1 day') AS n(day)
        LEFT JOIN bookings b ON b.accommodation_id=$1 AND b.status IN ('CONFIRMED','PENDING')
          AND b.check_in<=n.day AND b.check_out>n.day
        GROUP BY n.day
      ) AS occupancy`,
        [input.accommodationId, input.checkIn, input.checkOut],
      );
      if (count.rows[0].count >= (stay.availableRoomsCount ?? 1))
        throw new ApiError(409, "No rooms are available for those dates");
      const totalAmount = (Math.round(stay.pricePerNight * 100) * nights) / 100;
      const data = {
        ...input,
        id: `CN-BOOK-${randomUUID()}`,
        accommodationName: stay.name,
        totalAmount,
        status: "CONFIRMED",
        createdAt: new Date().toISOString(),
      };
      await client.query(
        "INSERT INTO bookings(id,user_id,accommodation_id,check_in,check_out,guests_count,room_type,total_amount,status,data) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)",
        [
          data.id,
          userFrom(response).id,
          input.accommodationId,
          input.checkIn,
          input.checkOut,
          input.guestsCount,
          input.roomType,
          totalAmount,
          data.status,
          data,
        ],
      );
      return data;
    });
    response.status(201).json(result);
  });
  api.get("/group-chat", requireUser, async (request, response) => {
    response.json(
      await readMessages(
        userFrom(response).id,
        typeof request.query.groupId === "string"
          ? request.query.groupId
          : undefined,
      ),
    );
  });
  api.post(
    "/group-chat",
    requireUser,
    publishingLimit,
    async (request, response) => {
      const permissions = await feature("enableGroupChat");
      const user = userFrom(response);
      if (
        permissions.allowOnlyVerifiedGuidesToMessage &&
        !(user.role === "guide" && user.is_verified) &&
        user.role !== "admin"
      )
        throw new ApiError(403, "Only verified guides can send messages");
      const input = v.message.parse(request.body);
      const member = await pool.query(
        "SELECT 1 FROM group_members WHERE group_id=$1 AND user_id=$2",
        [input.groupId, user.id],
      );
      if (!member.rowCount)
        throw new ApiError(403, "You are not a member of this group");
      const data = {
        ...input,
        id: randomUUID(),
        sender: user.name,
        avatar: "/tarasibale-logo.png",
        isGuide: user.role === "guide" && user.is_verified,
        timestamp: new Date().toISOString(),
      };
      await pool.query(
        "INSERT INTO messages(id,group_id,user_id,data) VALUES($1,$2,$3,$4)",
        [data.id, data.groupId, user.id, data],
      );
      response.status(201).json(data);
    },
  );
  api.post(
    "/social-posts",
    requireUser,
    publishingLimit,
    async (request, response) => {
      await feature("enableSocialCommunityStream");
      const input = v.post.parse(request.body);
      const user = userFrom(response);
      const data = {
        ...input,
        id: randomUUID(),
        author: user.name,
        handle: "@" + user.name.replace(/\W/g, "").toLowerCase(),
        avatar: "/tarasibale-logo.png",
        likes: 0,
        commentsCount: 0,
        timestamp: new Date().toISOString(),
        userLiked: false,
      };
      await pool.query(
        "INSERT INTO social_posts(id,user_id,data) VALUES($1,$2,$3)",
        [data.id, user.id, data],
      );
      response.status(201).json(data);
    },
  );
  api.post("/social-posts/:id/like", requireUser, async (request, response) => {
    await feature("enableSocialCommunityStream");
    const result = await transaction(pool, async (client) => {
      const post = await client.query(
        "SELECT data FROM social_posts WHERE id=$1 FOR UPDATE",
        [request.params.id],
      );
      if (!post.rowCount) throw new ApiError(404, "Post not found");
      const deleted = await client.query(
        "DELETE FROM social_likes WHERE post_id=$1 AND user_id=$2",
        [request.params.id, userFrom(response).id],
      );
      if (!deleted.rowCount)
        await client.query(
          "INSERT INTO social_likes(post_id,user_id) VALUES($1,$2)",
          [request.params.id, userFrom(response).id],
        );
      const count = await client.query(
        "SELECT count(*)::int AS likes FROM social_likes WHERE post_id=$1",
        [request.params.id],
      );
      return {
        ...post.rows[0].data,
        likes: count.rows[0].likes,
        userLiked: !deleted.rowCount,
      };
    });
    response.json(result);
  });
  api.use("/admin", requireUser, requireAdmin);
  api.put("/admin/permissions", async (request, response) => {
    const input = v.permissions.parse(request.body);
    await pool.query(
      "INSERT INTO settings(key,data) VALUES('permissions',$1) ON CONFLICT(key) DO UPDATE SET data=excluded.data",
      [input],
    );
    response.json(input);
  });
  api.put("/admin/catalog", async (request, response) => {
    const input = v.catalogUpdate.parse(request.body);
    await transaction(pool, async (client) => {
      for (const [key, kind] of [
        ["attractions", "attraction"],
        ["accommodations", "accommodation"],
        ["ferryRoutes", "ferry"],
      ] as const) {
        const items = input[key];
        if (!items) continue;
        if (new Set(items.map((item) => item.id)).size !== items.length)
          throw new ApiError(400, "Resource IDs must be unique");
        for (const item of items) {
          const result = await client.query(
            "INSERT INTO resources(id,kind,data) VALUES($1,$2,$3) ON CONFLICT(id) DO UPDATE SET data=excluded.data WHERE resources.kind=excluded.kind RETURNING id",
            [item.id, kind, item],
          );
          if (!result.rowCount)
            throw new ApiError(
              409,
              "This ID belongs to a different resource type",
            );
        }
        await client.query(
          "DELETE FROM resources WHERE kind=$1 AND NOT(id=ANY($2::text[])) AND data->>'isArchived' IS DISTINCT FROM 'true'",
          [kind, items.map((item) => item.id)],
        );
      }
    });
    response.json(input);
  });
  api.put("/admin/verifications", async (request, response) => {
    const input = z.array(v.verification).max(1000).parse(request.body);
    await transaction(pool, async (client) => {
      for (const item of input) {
        const userId = item.userId ?? null;
        if (userId) {
          const existing = await client.query<UserRow>(
            "SELECT * FROM users WHERE id=$1",
            [userId],
          );
          const account = existing.rows[0];
          if (
            !account ||
            (account.role !== item.appliedRole && account.role !== "admin")
          )
            throw new ApiError(
              400,
              "Verification must reference an existing account with the requested role",
            );
          // An application may predate local promotion; historical reviews must
          // never revoke or downgrade the independently granted admin identity.
          if (account.role !== "admin")
            await client.query("UPDATE users SET is_verified=$1 WHERE id=$2", [
              item.status === "APPROVED",
              userId,
            ]);
        }
        await client.query(
          "INSERT INTO verifications(id,user_id,data) VALUES($1,$2,$3) ON CONFLICT(id) DO UPDATE SET user_id=excluded.user_id,data=excluded.data",
          [item.id, userId, item],
        );
      }
    });
    response.json(input);
  });
  api.post("/chat", async (request, response) => {
    await feature("enableAiConcierge");
    const { message } = z
      .object({ message: z.string().trim().min(1).max(4000) })
      .parse(request.body);
    const lower = message.toLowerCase();
    const reply = /ferry|boat|weather|sea/.test(lower)
      ? "This is a curated guide, not a live maritime service. Check current sailings and sea conditions directly with the port or local authorities before traveling. The Travel tab contains editable reference schedules."
      : /stay|hotel|homestay|book/.test(lower)
        ? "Browse the Stays tab to compare accommodation details, choose dates and submit a booking. Availability and totals are checked by the server before confirmation."
        : /beach|snorkel|hike|trail/.test(lower)
          ? "Explore the Attractions and Map tabs for the imported Sibale Island destination and hiking information. Confirm access, guide requirements, and local conditions before setting out."
          : "I can help you find attractions, stays, ferry reference schedules, and itinerary tools in TaraSibale. This response uses a curated local guide; no live AI provider is configured.";
    response.json({ reply, source: "curated_guide" });
  });
  api.get("/weather", (_request, response) => {
    response
      .status(503)
      .json({
        error: "Live weather provider is not configured",
        source: "unavailable",
      });
  });
  api.use(
    (
      error: unknown,
      _request: Request,
      response: Response,
      _next: NextFunction,
    ) => {
      if (error instanceof ZodError) {
        response
          .status(400)
          .json({ error: error.issues[0]?.message ?? "Invalid request" });
        return;
      }
      if (error instanceof ApiError) {
        response.status(error.status).json({ error: error.message });
        return;
      }
      const code = (error as { code?: string }).code;
      const status = (error as { status?: number }).status;
      if (status === 400 || status === 413) {
        response
          .status(status)
          .json({
            error:
              status === 413 ? "Request is too large" : "Invalid JSON request",
          });
        return;
      }
      if (code === "23505") {
        response
          .status(409)
          .json({
            error: "An account or record with these details already exists",
          });
        return;
      }
      if (code === "23503" || code === "23001") {
        response
          .status(409)
          .json({
            error: "This record is missing or is referenced by existing data",
          });
        return;
      }
      if (code === "23514" || code === "22P02") {
        response
          .status(400)
          .json({ error: "Data does not meet database constraints" });
        return;
      }
      console.error("API operation failed", { code: code ?? "unavailable" });
      response
        .status(503)
        .json({
          error:
            "The database is unavailable or setup is incomplete. Please try again later.",
        });
    },
  );
  return api;
}
