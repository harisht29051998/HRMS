import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import routes
import { authRoutes } from './api/auth';
import { orgRoutes } from './api/orgs';
import { projectRoutes } from './api/projects';
import { sectionRoutes } from './api/sections';
import { taskRoutes } from './api/tasks';
import { commentRoutes } from './api/comments';
import { attachmentRoutes } from './api/attachments';
import { ruleRoutes } from './api/rules';
import { recurringTaskRoutes } from './api/recurring-tasks';

// Import middleware
import { errorHandler } from './middleware/errorHandler';
import { authenticateToken } from './middleware/auth';

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/orgs', authenticateToken, orgRoutes);
// Projects routes are nested under orgs: /api/v1/orgs/:id/projects
app.use('/api/v1/projects', authenticateToken, projectRoutes);
app.use('/api/v1/sections', authenticateToken, sectionRoutes);
app.use('/api/v1/tasks', authenticateToken, taskRoutes);
app.use('/api/v1/comments', authenticateToken, commentRoutes);
app.use('/api/v1/attachments', authenticateToken, attachmentRoutes);
app.use('/api/v1/rules', authenticateToken, ruleRoutes);
app.use('/api/v1/recurring', authenticateToken, recurringTaskRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Health check available at http://localhost:${PORT}/health`);
});

export default app;