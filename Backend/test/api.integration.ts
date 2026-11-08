import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { once } from 'node:events'
import { readFile, readdir } from 'node:fs/promises'
import type { AddressInfo } from 'node:net'
import { test } from 'node:test'
import pg from 'pg'
import { createApp } from '../src/app.js'

test('real PostgreSQL API: accounts, isolation, permissions, reviews and booking inventory', async (t) => {
  assert.ok(process.env.DATABASE_URL, 'DATABASE_URL must be configured for integration tests')
  const schema = `test_${randomUUID().replaceAll('-', '')}`
  const admin = new pg.Pool({ connectionString: process.env.DATABASE_URL })
  await admin.query(`CREATE SCHEMA "${schema}"`)
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, options: `-c search_path=${schema},public` })
  let server: ReturnType<ReturnType<typeof createApp>['listen']> | undefined
  try {
    const migrationDirectory = new URL('../migrations/', import.meta.url)
    for (const name of (await readdir(migrationDirectory)).filter(name => /^\d+_.*\.sql$/.test(name)).sort()) {
      await pool.query(await readFile(new URL(name, migrationDirectory), 'utf8'))
    }
    const catalog = JSON.parse(await readFile(new URL('../seed/catalog.json', import.meta.url), 'utf8')) as { resources: { id: string; kind: string; data: unknown }[] }
    for (const item of catalog.resources) await pool.query('INSERT INTO resources(id,kind,data) VALUES($1,$2,$3) ON CONFLICT DO NOTHING', [item.id, item.kind, item.data])
    const stay = { id: 'stay-test', name: 'Test stay', type: 'homestay', pricePerNight: 1000, maxGuests: 2, roomTypes: ['Standard'], availableRoomsCount: 1, availabilityStatus: 'AVAILABLE', isVerifiedPartner: false, coordinates: { lat: 12.9, lng: 121.7 }, rating: 0, reviewCount: 0, image: 'https://example.test/stay.jpg', location: 'Sibale', description: 'A test homestay', contactPhone: '09171234567', amenities: [] }
    await pool.query('INSERT INTO resources(id,kind,data) VALUES($1,$2,$3)', [stay.id, 'accommodation', stay])
    await pool.query("INSERT INTO travel_groups(id,name) VALUES('group-101','Island travelers')")
    await pool.query("INSERT INTO settings(key,data) VALUES('permissions',$1)", [{ enableGroupChat: true, enableHomestayBooking: true, enablePublicReviews: true, enableSocialCommunityStream: true, enableCloudVault: true, enableAiConcierge: true, requireLoginForReviews: true, allowOnlyVerifiedGuidesToMessage: false, allowOnlyVerifiedHostsToAcceptBookings: false, maintenanceMode: false }])
    // Exercise the full API regardless of the developer's portfolio setting.
    // Portfolio-mode boundaries have their own tests in portfolio.test.ts.
    server = createApp(async () => { await pool.query('SELECT 1') }, pool, { portfolioMode: false }).listen(0, '127.0.0.1')
    await once(server, 'listening')
    const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}/api`
    async function request(path: string, method = 'GET', body?: unknown, cookie = '', origin?: string) {
      const response = await fetch(base + path, { method, headers: { 'Content-Type': 'application/json', ...(cookie ? { Cookie: cookie } : {}), ...(origin ? { Origin: origin } : {}) }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) })
      return { status: response.status, body: response.status === 204 ? null : await response.json(), cookie: response.headers.get('set-cookie')?.split(';')[0] ?? '', setCookie: response.headers.get('set-cookie') ?? '' }
    }
    const password = 'Integration test passphrase!'
    let owner = '', other = '', ownerId = ''
    await t.test('catalog exposes all nine barangays with fiesta details explicitly pending', async () => {
      const result = await request('/catalog')
      assert.equal(result.status, 200)
      const directory = result.body.cultureItems.filter((item: { category: string }) => item.category === 'fiesta-directory')
      assert.deepEqual(directory.map((item: { barangay: string }) => item.barangay).sort(),
        ['Bachawan', 'Calabasahan', 'Dalajican', 'Masadya', 'Masudsud', 'Poblacion', 'Sampong', 'San Pedro', 'San Vicente'])
      for (const item of directory) {
        assert.equal(item.dateLabel, 'To be confirmed')
        assert.equal(item.patronSaint, null)
      }
      assert.ok(result.body.cultureItems.some((item: { id: string }) => item.id === 'culture-event-immaculate-conception'))
      assert.equal(result.body.cultureItems.filter((item: { category: string }) => item.category === 'tradition').length, 2)
    })
    await t.test('reapplying the barangay directory migration preserves local edits and avoids duplicates', async () => {
      await pool.query('BEGIN')
      try {
        await pool.query(`UPDATE resources SET data=jsonb_set(data, '{dateLabel}', '"Local confirmation pending"'::jsonb) WHERE id='culture-fiesta-directory-bachawan'`)
        const migration = await readFile(new URL('../migrations/010_barangay_fiesta_directory.sql', import.meta.url), 'utf8')
        await pool.query(migration)
        await pool.query(migration)
        const saved = await pool.query("SELECT data FROM resources WHERE kind='culture' AND data->>'category'='fiesta-directory'")
        assert.equal(saved.rows.length, 9)
        assert.equal(saved.rows.find(item => item.data.id === 'culture-fiesta-directory-bachawan')?.data.dateLabel, 'Local confirmation pending')
      } finally {
        await pool.query('ROLLBACK')
      }
    })
    await t.test('guest cannot write private resources or access admin', async () => {
      assert.equal((await request('/bookings', 'POST', {})).status, 401)
      assert.equal((await request('/admin/permissions', 'PUT', {})).status, 401)
      assert.equal((await request('/auth/me')).body, null)
    })
    await t.test('signup cannot create an administrator', async () => {
      assert.equal((await request('/auth/signup', 'POST', { name: 'Attacker', email: 'admin@example.test', password, role: 'admin' })).status, 400)
      const first = await request('/auth/signup', 'POST', { name: 'Owner Tester', email: 'owner@example.test', password, role: 'traveler' })
      assert.equal(first.status, 201)
      assert.equal(first.body.role, 'traveler')
      assert.equal(first.body.isVerified, false)
      assert.equal(first.setCookie.includes('HttpOnly'), true)
      assert.equal(first.setCookie.includes('SameSite=Lax'), true)
      owner = first.cookie; ownerId = first.body.id
      const second = await request('/auth/signup', 'POST', { name: 'Other Tester', email: 'other@example.test', password, role: 'host' })
      assert.equal(second.status, 201); other = second.cookie
      assert.equal((await request('/auth/signup', 'POST', { name: 'Duplicate', email: 'OWNER@example.test', password, role: 'traveler' })).status, 409)
    })
    await t.test('wrong password and cross-site mutation are rejected', async () => {
      assert.equal((await request('/auth/login', 'POST', { email: 'owner@example.test', password: 'wrong-password' })).status, 401)
      assert.equal((await request('/auth/login', 'POST', { email: 'owner@example.test', password })).status, 200)
      assert.equal((await request('/user-state', 'PUT', { documents: [] }, owner, 'https://attacker.invalid')).status, 403)
      assert.equal((await request('/admin/permissions', 'PUT', {}, owner)).status, 403)
    })
    await t.test('documents and notifications remain private across sessions', async () => {
      assert.equal((await request('/user-state', 'PUT', { documents: [{ id: 'doc-test', title: 'Private permit', category: 'permit', uploadDate: '2026-10-25', size: '0 KB' }] }, owner)).status, 200)
      assert.equal((await request('/bootstrap', 'GET', undefined, owner)).body.documents.length, 1)
      assert.equal((await request('/bootstrap', 'GET', undefined, other)).body.documents.length, 0)
    })
    await t.test('stale tabs cannot write private state under another account session', async () => {
      const documents = [{ id: 'stale-private', title: 'Private account A document', category: 'id', uploadDate: '2026-10-25', size: '0 KB' }];
      const before = (await request('/bootstrap', 'GET', undefined, other)).body.documents;
      const response = await fetch(base + '/user-state', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Cookie: other, 'X-TaraSibale-User-Id': ownerId },
        body: JSON.stringify({ documents }),
      });
      assert.equal(response.status, 409);
      assert.deepEqual((await request('/bootstrap', 'GET', undefined, other)).body.documents, before);
      const valid = await fetch(base + '/user-state', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Cookie: owner, 'X-TaraSibale-User-Id': ownerId },
        body: JSON.stringify({ checklists: {} }),
      });
      assert.equal(valid.status, 200);
    })
    await t.test('reviews validate rating, references, and server authorship', async () => {
      const review = { targetId: 'stay-test', rating: 5, comment: 'Comfortable stay', tags: [] }
      assert.equal((await request('/reviews', 'POST', { ...review, rating: 6 }, owner)).status, 400)
      assert.equal((await request('/reviews', 'POST', { ...review, targetId: 'missing' }, owner)).status, 404)
      const saved = await request('/reviews', 'POST', { ...review, author: 'Forged admin' }, owner)
      assert.equal(saved.status, 201); assert.equal(saved.body.author, 'Owner Tester')
      assert.equal((await request('/reviews')).body.length, 1)
      const helpful = await request(`/reviews/${saved.body.id}/helpful`, 'POST', {}, other)
      assert.equal(helpful.status, 200); assert.equal(helpful.body.helpfulCount, 1)
      assert.equal((await request(`/reviews/${saved.body.id}/helpful`, 'POST', {}, other)).body.helpfulCount, 1)
    })
    await t.test('group membership and message authorship are enforced', async () => {
      const message = await request('/group-chat', 'POST', { text: 'Meet at the port', groupId: 'group-101', sender: 'Forged Guide', isGuide: true }, owner)
      assert.equal(message.status, 201); assert.equal(message.body.sender, 'Owner Tester'); assert.equal(message.body.isGuide, false)
      assert.equal((await request('/group-chat', 'GET', undefined, other)).body.length, 1)
      assert.equal((await request('/group-chat', 'POST', { text: 'Private group', groupId: 'not-a-member' }, owner)).status, 403)
    })
    await t.test('social posts and likes persist with authenticated authorship', async () => {
      const saved = await request('/social-posts', 'POST', { caption: 'Sibale trip', image: 'https://example.test/photo.jpg', location: 'Sibale', author: 'Forged author' }, owner)
      assert.equal(saved.status, 201); assert.equal(saved.body.author, 'Owner Tester')
      const like = await request(`/social-posts/${saved.body.id}/like`, 'POST', {}, other)
      assert.equal(like.status, 200); assert.equal(like.body.likes, 1); assert.equal(like.body.userLiked, true)
      assert.equal((await request(`/social-posts/${saved.body.id}/like`, 'POST', {}, other)).body.likes, 0)
    })
    await t.test('community attachments and caption-only posts survive catalog reload with server authorship', async () => {
      const image = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aVYkAAAAASUVORK5CYII='
      const saved = await request('/social-posts', 'POST', { caption: 'My photo', image, location: 'Sibale', author: 'Forged author' }, owner)
      assert.equal(saved.status, 201)
      assert.equal(saved.body.image, `/api/social-posts/${saved.body.id}/image`)
      const photo = await fetch(base.replace(/\/api$/, '') + saved.body.image)
      assert.equal(photo.status, 200)
      assert.equal(photo.headers.get('content-type'), 'image/png')
      assert.equal(photo.headers.get('x-content-type-options'), 'nosniff')
      assert.equal(photo.headers.get('cache-control'), 'no-store')
      assert.deepEqual(Buffer.from(await photo.arrayBuffer()), Buffer.from(image.split(',')[1]!, 'base64'))
      const liked = await request(`/social-posts/${saved.body.id}/like`, 'POST', {}, other)
      assert.equal(liked.body.image, saved.body.image)
      assert.equal(saved.body.author, 'Owner Tester')
      const textOnly = await request('/social-posts', 'POST', { caption: 'No photo today', location: 'Sibale' }, owner)
      assert.equal(textOnly.status, 201)
      assert.equal(textOnly.body.image, undefined)
      const reloaded = await request('/catalog')
      assert.equal(reloaded.body.socialPosts.find((item: { id: string }) => item.id === saved.body.id)?.image, saved.body.image)
      assert.equal(reloaded.body.socialPosts.find((item: { id: string }) => item.id === textOnly.body.id)?.image, undefined)
      assert.equal((await request('/social-posts', 'POST', { caption: 'Invalid', image: image.replace('image/png', 'image/jpeg'), location: 'Sibale' }, owner)).status, 400)
      assert.equal((await request('/social-posts', 'POST', { caption: 'Invalid', image: '', location: 'Sibale' }, owner)).status, 400)
    })
    await t.test('catalog excludes large stored image bytes and image reads reject invalid records', async () => {
      const small = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aVYkAAAAASUVORK5CYII=', 'base64')
      const bytes = Buffer.alloc(1024 * 1024)
      small.subarray(0, 33).copy(bytes)
      small.subarray(-12).copy(bytes, bytes.length - 12)
      const image = `data:image/png;base64,${bytes.toString('base64')}`
      for (let i = 0; i < 4; i++) {
        await pool.query('INSERT INTO social_posts(id,user_id,data) VALUES($1,$2,$3)', [`large-${i}`, ownerId, { id: `large-${i}`, caption: 'Large fixture', image }])
      }
      const catalog = await request('/catalog')
      assert.ok(JSON.stringify(catalog.body.socialPosts).length < 20000, 'Catalog must contain metadata, not attachment bytes')
      assert.equal(catalog.body.socialPosts.find((p: { id: string }) => p.id === 'large-0').image, '/api/social-posts/large-0/image')
      const legacy = await fetch(base + '/social-posts/large-0/image')
      assert.equal(legacy.status, 200)
      assert.equal((await legacy.arrayBuffer()).byteLength, bytes.length)
      for (const [id, bad] of [['invalid', 'data:image/png;base64,AAAA'], ['svg', 'data:image/svg+xml;base64,AAAA'], ['mismatch', image.replace('image/png', 'image/jpeg')], ['oversized', image + 'AAAA'], ['remote', 'https://example.test/photo.jpg'], ['text-only', undefined]] as const) {
        await pool.query('INSERT INTO social_posts(id,user_id,data) VALUES($1,$2,$3)', [id, ownerId, { id, caption: 'Fixture', image: bad }])
        assert.equal((await fetch(base + `/social-posts/${id}/image`)).status, 404)
      }
      assert.equal((await fetch(base + '/social-posts/missing/image')).status, 404)
    })
    await t.test('vault rejects executable data URLs and invalid itinerary dates remain separate from booking dates', async () => {
      assert.equal((await request('/user-state', 'PUT', { documents: [{ id: 'x', title: 'Bad file', category: 'id', uploadDate: '2026-10-25', size: '1 KB', fileData: 'data:text/html;base64,PHNjcmlwdD4=' }] }, owner)).status, 400)
      assert.equal((await request('/user-state', 'PUT', { itinerary: [{ dayNumber: 1, title: 'Day one', items: [{ id: 'i1', title: 'Explore' }] }], notifications: [{ id: 'n1', title: 'Trip saved' }] }, owner)).status, 200)
      assert.equal((await request('/bootstrap', 'GET', undefined, owner)).body.itinerary.length, 1)
      assert.equal((await request('/bootstrap', 'GET', undefined, other)).body.itinerary.length, 0)
    })
    const booking = { accommodationId: 'stay-test', guestName: 'Owner', guestEmail: 'owner@example.test', phone: '09171234567', checkIn: '2099-01-10', checkOut: '2099-01-12', guestsCount: 2, roomType: 'Standard', totalAmount: 1, status: 'CANCELLED' }
    await t.test('bookings reject reversed dates and excessive guests', async () => {
      assert.equal((await request('/bookings', 'POST', { ...booking, checkOut: '2099-01-09' }, owner)).status, 400)
      assert.equal((await request('/bookings', 'POST', { ...booking, guestsCount: 3 }, owner)).status, 400)
      assert.equal((await request('/bookings', 'POST', { ...booking, roomType: 'Invented room' }, owner)).status, 400)
    })
    await t.test('parallel bookings cannot oversell and price is server calculated', async () => {
      const results = await Promise.all([request('/bookings', 'POST', booking, owner), request('/bookings', 'POST', booking, other)])
      assert.deepEqual(results.map(r => r.status).sort(), [201, 409])
      const saved = results.find(r => r.status === 201)!.body
      assert.equal(saved.totalAmount, 2000); assert.equal(saved.status, 'CONFIRMED')
      const first = await request('/bookings', 'GET', undefined, owner)
      const second = await request('/bookings', 'GET', undefined, other)
      assert.equal(first.body.length + second.body.length, 1)
      assert.equal(Math.min(first.body.length, second.body.length), 0)
    })
    await t.test('adjacent reservations do not falsely exhaust multi-room availability', async () => {
      const multiRoom = { ...stay, id: 'stay-multi', availableRoomsCount: 2 }
      await pool.query('INSERT INTO resources(id,kind,data) VALUES($1,$2,$3)', [multiRoom.id, 'accommodation', multiRoom])
      const firstNight = { ...booking, accommodationId: multiRoom.id, checkIn: '2099-02-10', checkOut: '2099-02-11' }
      const secondNight = { ...firstNight, checkIn: '2099-02-11', checkOut: '2099-02-12' }
      assert.equal((await request('/bookings', 'POST', firstNight, owner)).status, 201)
      assert.equal((await request('/bookings', 'POST', secondNight, owner)).status, 201)
      assert.equal((await request('/bookings', 'POST', { ...firstNight, checkOut: '2099-02-12' }, other)).status, 201)
      assert.equal((await request('/bookings', 'POST', { ...firstNight, checkOut: '2099-02-12' }, other)).status, 409)
    })
    await t.test('admin role is obtained from database, not client claims', async () => {
      await pool.query("UPDATE users SET role='admin',is_verified=true WHERE id=$1", [ownerId])
      const permissions = (await request('/catalog')).body.systemPermissions
      assert.equal((await request('/admin/permissions', 'PUT', permissions, owner)).status, 200)
      assert.equal((await request('/admin/catalog', 'PUT', { accommodations: [] }, other)).status, 403)
      assert.equal((await request('/admin/permissions', 'PUT', { ...permissions, maintenanceMode: true }, owner)).status, 200)
      const reviewId = (await pool.query('SELECT id FROM reviews LIMIT 1')).rows[0].id
      const postId = (await pool.query('SELECT id FROM social_posts LIMIT 1')).rows[0].id
      assert.equal((await request(`/reviews/${reviewId}/helpful`, 'POST', {}, other)).status, 403)
      assert.equal((await request(`/social-posts/${postId}/like`, 'POST', {}, other)).status, 403)
      assert.equal((await request('/admin/permissions', 'PUT', permissions, owner)).status, 200)
    })
    await t.test('promoted administrators do not block verification of unrelated accounts', async () => {
      const guide = await request('/auth/signup', 'POST', { name: 'Guide Tester', email: 'guide@example.test', password, role: 'guide' })
      assert.equal(guide.status, 201)
      await pool.query("UPDATE users SET role='admin',is_verified=true WHERE email='other@example.test'")
      const applicants = (await request('/bootstrap', 'GET', undefined, owner)).body.verificationApplicants
      const updated = applicants.map((item: { userId: string; status: string }) => item.userId === guide.body.id ? { ...item, status: 'APPROVED' } : item)
      assert.equal((await request('/admin/verifications', 'PUT', updated, owner)).status, 200)
      assert.equal((await pool.query('SELECT is_verified FROM users WHERE id=$1', [guide.body.id])).rows[0].is_verified, true)
      assert.equal((await pool.query("SELECT is_verified FROM users WHERE email='other@example.test'")).rows[0].is_verified, true)
    })
    await t.test('unpublished demo places stay out of the catalog and cannot receive new reviews', async () => {
      const archived = { ...stay, id: 'archived-demo', isArchived: true }
      await pool.query('INSERT INTO resources(id,kind,data) VALUES($1,$2,$3)', [archived.id, 'accommodation', archived])
      const catalog = (await request('/catalog')).body
      assert.equal(catalog.accommodations.some((item: { id: string }) => item.id === archived.id), false)
      assert.equal((await request('/reviews', 'POST', { targetId: archived.id, rating: 5, comment: 'Old demo', tags: [] }, other)).status, 404)
    })
    await t.test('catalog edits preserve published source credits and archived referenced history', async () => {
      const sourced = JSON.parse(await readFile(new URL('../seed/sourced-attractions.json', import.meta.url), 'utf8'))
      const old = { ...sourced[0], id: 'archived-attraction', isArchived: true }
      await pool.query("INSERT INTO resources(id,kind,data) VALUES($1,'attraction',$2)", [old.id, old])
      await pool.query('INSERT INTO reviews(id,target_id,user_id,data) VALUES($1,$2,$3,$4)', ['historical-review', old.id, ownerId, { id: 'historical-review', targetId: old.id, comment: 'Historical record', rating: 4 }])
      const saved = await request('/admin/catalog', 'PUT', { attractions: sourced }, owner)
      assert.equal(saved.status, 200)
      const result = (await request('/catalog')).body.attractions.find((item: { id: string }) => item.id === sourced[0].id)
      assert.deepEqual(result.photoCredit, sourced[0].photoCredit)
      assert.deepEqual(result.sources, sourced[0].sources)
      assert.equal((await pool.query('SELECT count(*)::int AS count FROM resources WHERE id=$1', [old.id])).rows[0].count, 1)
    })
    await t.test('reference-only lodgings preserve unknown facts and cannot create reservations', async () => {
      const listings = JSON.parse(await readFile(new URL('../seed/sourced-accommodations.json', import.meta.url), 'utf8'))
      const current = (await request('/catalog')).body.accommodations.filter((item: { id: string }) => !listings.some((listing: { id: string }) => listing.id === item.id))
      const saved = await request('/admin/catalog', 'PUT', { accommodations: [...listings, ...current] }, owner)
      assert.equal(saved.status, 200, JSON.stringify(saved.body))
      const published = (await request('/catalog')).body.accommodations
      for (const listing of listings) {
        const item = published.find((item: { id: string }) => item.id === listing.id)
        assert.equal(item.pricePerNight, null)
        assert.equal(item.maxGuests, null)
        assert.equal(item.coordinates, null)
        assert.equal(item.bookingMode, 'reference-only')
        assert.deepEqual(item.sources, listing.sources)
        const result = await request('/bookings', 'POST', { accommodationId: listing.id, guestName: 'Test guest', guestEmail: 'other@example.test', phone: '09171234567', checkIn: '2099-01-01', checkOut: '2099-01-02', guestsCount: 1, roomType: 'Standard Room' }, other)
        assert.equal(result.status, 409)
        assert.match(result.body.error, /not enabled/i)
        assert.equal((await pool.query('SELECT count(*)::int AS count FROM bookings WHERE accommodation_id=$1', [listing.id])).rows[0].count, 0)
      }
    })
    await t.test('food catalog publishes sourced entries and photo credits without old demo dishes', async () => {
      const foods = JSON.parse(await readFile(new URL('../seed/sourced-foods.json', import.meta.url), 'utf8'))
      const items = (await request('/catalog')).body.cultureItems
      assert.equal(items.some((item: { id: string }) => ['culture-dish-1','culture-dish-2'].includes(item.id)), false)
      for (const food of foods) {
        const item = items.find((item: { id: string }) => item.id === food.id)
        assert.equal(item.category, 'dish')
        assert.deepEqual(item.sources, food.sources)
        assert.deepEqual(item.photoCredit, food.photoCredit)
        assert.equal(item.image, food.image)
      }
    })
    await t.test('publishing throttles cover all append routes and isolate accounts', async () => {
      const publisher = await request('/auth/signup', 'POST', {name:'Publisher',email:'publisher@example.test',password,role:'traveler'});
      assert.equal(publisher.status, 201);
      const payloads = [
        ['/reviews', {targetId:'stay-test',rating:5,comment:'Test review',tags:[]}],
        ['/group-chat', {text:'Test message',groupId:'group-101'}],
        ['/social-posts', {caption:'Test post',image:'https://example.test/photo.jpg',location:'Sibale'}],
      ] as const;
      for (let index = 0; index < 30; index++) {
        const [path, body] = payloads[index % payloads.length]!;
        assert.equal((await request(path, 'POST', body, publisher.cookie)).status, 201);
      }
      for (const [path, body] of payloads) {
        assert.equal((await request(path, 'POST', body, publisher.cookie)).status, 429);
      }
      assert.equal((await request('/group-chat', 'POST', {text:'Independent quota',groupId:'group-101'}, other)).status, 201);
    })
    await t.test('logout revokes the stored session', async () => {
      assert.equal((await request('/auth/logout', 'POST', {}, owner)).status, 204)
      assert.equal((await request('/auth/me', 'GET', undefined, owner)).body, null)
    })
  } finally {
    if (server) await new Promise<void>((resolve) => { server!.close(() => resolve()); server!.closeIdleConnections() })
    await pool.end()
    await admin.query(`DROP SCHEMA "${schema}" CASCADE`)
    await admin.end()
  }
})

