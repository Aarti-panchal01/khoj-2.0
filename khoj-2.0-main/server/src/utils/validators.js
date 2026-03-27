const { z } = require('zod');

const signupSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email().max(254),
  password: z.string().min(8).max(128), // raised from 6 to 8
  phone: z.string().min(8).max(20),
  college: z.string().min(2).max(200),
  campus: z.string().max(200).optional(),
});

const loginSchema = z.object({
  email: z.string().email().max(254),
  password: z.string().min(8).max(128),
  college: z.string().min(2).max(200),
  campus: z.string().max(200).optional(),
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
  contactPreference: z.enum(['both', 'email', 'phone']).optional(),
  campus: z.string().max(200).optional(),
});

module.exports = {
  signupSchema,
  loginSchema,
  itemSchema,
};
