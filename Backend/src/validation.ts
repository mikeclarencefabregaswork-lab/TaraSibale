import { z } from 'zod'

const text = (max = 300) => z.string().trim().min(1).max(max)
export const email = z.email().max(254).transform(value => value.toLowerCase())
export const role = z.enum(['traveler', 'resident', 'guide', 'host'])
export const signup = z.object({ name: text(120), email, password: z.string().min(8).max(128), role: role.default('traveler') })
export const login = z.object({ email, password: z.string().min(1).max(128), rememberMe: z.boolean().optional() })
export const review = z.object({ targetId: text(100), rating: z.number().int().min(1).max(5), comment: text(4000), tags: z.array(text(50)).max(10).default([]) })
const date = z.iso.date()
export const booking = z.object({ accommodationId: text(100), guestName: text(120), guestEmail: email, phone: text(50), checkIn: date, checkOut: date, guestsCount: z.number().int().min(1).max(100), roomType: text(120) }).refine(value => value.checkOut > value.checkIn, 'Check-out must be after check-in').refine(value => value.checkIn >= new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Manila' }), 'Check-in cannot be in the past')
export const message = z.object({ text: text(4000), groupId: text(100).default('group-101'), locationPin: z.object({ name: text(150), lat: z.number().min(-90).max(90), lng: z.number().min(-180).max(180) }).optional() })
const url = z.union([z.literal('/assets/photo-unavailable.svg'), z.url().max(2048).refine(value => ['https:', 'http:'].includes(new URL(value).protocol), 'Only HTTP image URLs are supported')])
export const post = z.object({ caption: text(4000), image: url, location: text(200) })
const documentData = z.string().max(1400000).regex(/^data:(application\/pdf|image\/(png|jpeg|webp));base64,[A-Za-z0-9+/]*={0,2}$/).refine(value => {
  const encoded = value.slice(value.indexOf(',') + 1)
  const bytes = Buffer.from(encoded, 'base64')
  return bytes.length <= 1024 * 1024 && bytes.toString('base64') === encoded
}, 'Files must contain valid base64 data and be no larger than 1 MB')
const jsonItem = z.object({ id: text(100) }).passthrough()
export const userState = z.object({
  notifications: z.array(jsonItem).max(500).optional(),
  documents: z.array(z.object({ id: text(100), title: text(250), category: z.enum(['ticket', 'id', 'permit', 'voucher']), uploadDate: date, size: text(50), notes: z.string().max(2000).optional(), fileData: documentData.optional(), fileUrl: url.optional() })).max(20).refine(items => items.reduce((sum, item) => sum + (item.fileData?.length ?? 0), 0) <= 4000000, 'Document vault limit is 4 MB of encoded data').optional(),
  itinerary: z.array(z.object({ dayNumber: z.number().int().min(1).max(365), title: text(250), dateLabel: z.string().max(100).optional(), items: z.array(jsonItem).max(200) })).max(365).optional(),
  checklists: z.record(z.string().max(100), z.unknown()).optional(),
})
export const permissions = z.object({
  enableGroupChat: z.boolean(), enableHomestayBooking: z.boolean(), enableCloudVault: z.boolean(), enablePublicReviews: z.boolean(), enableSocialCommunityStream: z.boolean(), enableAiConcierge: z.boolean(), allowOnlyVerifiedGuidesToMessage: z.boolean(), allowOnlyVerifiedHostsToAcceptBookings: z.boolean(), requireLoginForReviews: z.boolean(), maintenanceMode: z.boolean(),
})
const coordinate = z.object({ lat: z.number().min(-90).max(90), lng: z.number().min(-180).max(180) })
const base = z.object({ id: text(100), name: text(200), image: url, description: text(10000), gallery: z.array(url).max(30).optional(), rating: z.number().min(0).max(5), reviewCount: z.number().int().min(0) })
export const attraction = base.extend({ category: z.enum(['beach', 'landmark', 'culture', 'viewpoint', 'sanctuary']), locationName: text(250), lat: z.number().min(-90).max(90), lng: z.number().min(-180).max(180), highlights: z.array(text(300)).max(50), entryFee: text(150), bestTime: text(150), audioGuideText: z.string().max(10000).optional(), isPopular: z.boolean().optional(), coordinateStatus: z.enum(['mapped','unconfirmed']).optional(), coordinateSource: url.optional(), verifiedAt: z.iso.date().optional(), sources: z.array(z.object({title: text(250),url})).max(10).optional(), photoCredit: z.object({name: text(250),url,caption: text(1000),usage:z.enum(['local-preview','open-license'])}).optional(), isArchived: z.boolean().optional() })
export const accommodation = base.extend({ type: z.enum(['resort', 'homestay', 'cottage', 'inn']), pricePerNight: z.number().min(0).max(1000000).nullable(), location: text(250), amenities: z.array(text(100)).max(50), roomTypes: z.array(text(120)).max(50), maxGuests: z.number().int().min(1).max(100).nullable(), contactPhone: z.string().trim().max(50), coordinates: coordinate.nullable(), isFeatured: z.boolean().optional(), availabilityStatus: z.enum(['AVAILABLE', 'FEW_ROOMS', 'FULLY_BOOKED', 'MAINTENANCE']).optional(), availableRoomsCount: z.number().int().min(0).max(10000).optional(), hostName: text(120).optional(), isVerifiedPartner: z.boolean().optional(), bookingMode: z.enum(['online','reference-only']).optional(), evidenceLabel: text(500).optional(), verificationNote: text(2000).optional(), verifiedAt: z.iso.date().optional(), sources: z.array(z.object({title: text(250),url})).max(10).optional(), isArchived: z.boolean().optional() }).refine(item => item.bookingMode === 'reference-only' || (item.pricePerNight !== null && item.maxGuests !== null && item.coordinates !== null && item.roomTypes.length > 0 && item.contactPhone.length > 0), 'Online accommodations require rates, capacity, coordinates, rooms and contact information')
export const ferry = z.object({ id: text(100), origin: text(200), destination: text(200), boatName: text(200), departureTime: text(100), arrivalTime: text(100), fare: text(100), frequency: text(200), status: z.enum(['SCHEDULED', 'BOARDING', 'CANCELLED_SEA', 'ON_TIME', 'DELAYED']), notes: z.string().max(3000), advisoryReason: z.string().max(3000).optional(), delayDuration: z.string().max(100).optional() })
export const catalogUpdate = z.object({ attractions: z.array(attraction).max(1000).optional(), accommodations: z.array(accommodation).max(1000).optional(), ferryRoutes: z.array(ferry).max(1000).optional() })
export const verification = z.object({ id: text(100), userId: z.string().max(100).optional(), fullName: text(120), email, phone: text(50), appliedRole: z.enum(['host', 'guide', 'resident']), businessOrTitleName: text(250), barangay: text(150), documentType: text(250), documentSummary: text(5000), status: z.enum(['PENDING', 'APPROVED', 'REJECTED']), submittedAt: date, reviewedAt: date.optional(), notes: z.string().max(5000).optional(), accreditationNumber: z.string().max(100).optional(), experienceYears: z.number().min(0).max(100).optional(), maxCapacityOrGuests: z.number().int().min(0).max(10000).optional(), avatar: url.optional() })
