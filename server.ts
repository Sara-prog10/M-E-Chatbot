import express from "express";
import { createServer as createViteServer } from "vite";
import { createRequire } from 'module';
import path from 'path';

const require = createRequire(import.meta.url);
const admin = require('firebase-admin');

// Initialize Firebase Admin
// This requires a service account. For simplicity in the preview/dev environment,
// if FIREBASE_SERVICE_ACCOUNT is available, we use it. Otherwise, we try to
// initialize without credentials (works in Google Cloud environments) or it will 
// throw an error. Admin SDK requires REAL authentication to manage users.
try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    let serviceAccount;
    try {
      serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
    } catch (parseError) {
      console.warn("WARNING: FIREBASE_SERVICE_ACCOUNT_KEY could not be parsed as JSON. Please ensure it contains the full JSON string of your service account key.");
    }
    
    if (serviceAccount) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
    } else {
      admin.initializeApp();
    }
  } else {
    // Attempt default initialization
    admin.initializeApp();
  }
} catch (error) {
  console.log("Firebase Admin initialization error (can be ignored if just building):", error);
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Middleware to verify Admin Token
  const verifyAdmin = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.split('Bearer ')[1];
    try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      
      // Basic check: You could check a custom claim or verify if the underlying database
      // specifically marks this uid as an admin. For now, we will verify the email or a Firestore document.
      // Easiest is to check the 'admins' collection in Firestore.
      const adminDoc = await admin.firestore().collection('admins').doc(decodedToken.uid).get();
      
      if (!adminDoc.exists) {
        return res.status(403).json({ error: 'Forbidden: Not an admin' });
      }

      req.user = decodedToken;
      next();
    } catch (error) {
      console.error('Token verification failed:', error);
      res.status(401).json({ error: 'Unauthorized' });
    }
  };

  // Admin Routes
  app.get('/api/admin/users', verifyAdmin, async (req, res) => {
    try {
      const listUsersResult = await admin.auth().listUsers(100);
      res.json({ users: listUsersResult.users.map(u => ({ uid: u.uid, email: u.email, displayName: u.displayName, metadata: u.metadata })) });
    } catch (error) {
      console.error('Error listing users:', error);
      res.status(500).json({ error: 'Failed to list users' });
    }
  });

  app.post('/api/admin/users', verifyAdmin, async (req, res) => {
    const { email, password, displayName } = req.body;
    try {
      const userRecord = await admin.auth().createUser({
        email,
        password,
        displayName,
      });
      res.json({ user: { uid: userRecord.uid, email: userRecord.email, displayName: userRecord.displayName } });
    } catch (error: any) {
      console.error('Error creating user:', error);
      res.status(500).json({ error: error.message || 'Failed to create user' });
    }
  });

  app.delete('/api/admin/users/:uid', verifyAdmin, async (req, res) => {
    const { uid } = req.params;
    try {
      // Don't let an admin delete themselves to prevent being locked out
      if (uid === (req as any).user.uid) {
         return res.status(400).json({ error: 'Cannot delete your own admin account.' });
      }

      await admin.auth().deleteUser(uid);
      res.json({ success: true });
    } catch (error: any) {
      console.error('Error deleting user:', error);
      res.status(500).json({ error: error.message || 'Failed to delete user' });
    }
  });

  // Assign admin role (internal endpoint or bootstrapping)
  app.post('/api/admin/bootstrap', async (req, res) => {
    // Secret endpoint to bootstrap the first admin. 
    // Uses ADMIN_SECRET from env to secure.
    const { email, secret } = req.body;
    if (!process.env.ADMIN_SECRET || secret !== process.env.ADMIN_SECRET) {
      return res.status(403).json({ error: 'Invalid secret' });
    }

    try {
      const userRecord = await admin.auth().getUserByEmail(email);
      await admin.firestore().collection('admins').doc(userRecord.uid).set({ role: 'admin', email });
      res.json({ success: true, message: `Admin privileges granted to ${email}` });
    } catch (error: any) {
      console.error('Error bootstrapping admin:', error);
      res.status(500).json({ error: error.message });
    }
  });


  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production: serve built static files
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
