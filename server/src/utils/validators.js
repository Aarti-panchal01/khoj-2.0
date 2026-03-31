const { z } = require('zod');

const signupSchema = z.object({
  email: z.string().email().max(254),
  password: z.string().min(6).max(128),
});

const loginSchema = z.object({
  email: z.string().email().max(254),
  password: z.string().min(6).max(128),
});

const authProfilePatchSchema = z.object({
  name: z.string().min(2).max(100),
  universityId: z.string().min(1),
  campusId: z.string().optional().nullable(),
  phone: z
    .string()
    .min(7)
    .max(20)
    .regex(/^\+?[0-9\s\-()]{7,20}$/, 'Enter a valid phone number')
    .optional(),
});

const googleAuthSchema = z.object({
  credential: z.string().min(10),
});

const itemSchema = z.object({
  type: z.enum(['found', 'lost']),
  title: z.string().min(3).max(200),
  description: z.string().min(10).max(2000),
  category: z.string().min(2).max(100),
  location: z.string().min(2).max(300),
  date: z.coerce.date(),
  // Validate image URLs are HTTPS Cloudinary URLs only
  images: z.array(
    z.string().url().max(500).refine(
      (url) => url.startsWith('https://res.cloudinary.com/'),
      { message: 'Images must be Cloudinary URLs' }
    )
  ).max(5).optional(),
  urgent: z.boolean().optional(),
  reward: z.enum(['gratitude', 'food_treat', 'coffee', 'cash_reward', 'gift', 'none']).optional(),
  contactPreference: z.enum(['both', 'email', 'phone']).optional(),
});

module.exports = {
  signupSchema,
  loginSchema,
  authProfilePatchSchema,
  googleAuthSchema,
  itemSchema,
};
