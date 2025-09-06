import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { pool } from '../config/database';

const router = Router();

// Debug endpoint to check user status
router.get('/user-status', authenticate, async (req, res): Promise<void> => {
  try {
    const userId = (req as any).user.userId;
    
    const connection = await pool.getConnection();
    const [rows] = await connection.execute(
      'SELECT id, email, role, is_active, email_verified FROM users WHERE id = ?',
      [userId]
    );
    connection.release();

    const users = rows as any[];
    if (users.length === 0) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    const user = users[0];
    
    res.json({
      success: true,
      data: {
        user: user,
        tokenInfo: (req as any).user,
        isActive: user.is_active,
        role: user.role,
        canAccessAdmin: user.role === 'admin' && (user.is_active === true || user.is_active === null)
      }
    });
  } catch (error: any) {
    console.error('Debug user status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error?.message || 'Unknown error'
    });
  }
});

export default router;
