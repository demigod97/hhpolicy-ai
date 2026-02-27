import React from 'react';
import { motion } from 'framer-motion';
import AuthForm from '@/components/auth/AuthForm';
import { Shield } from 'lucide-react';

const Auth = () => {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-background via-background to-muted/30">
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-8">
          <motion.div
            className="flex justify-center mb-6"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          >
            <div className="h-20 w-20 bg-primary rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-3xl">HH</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <h1 className="text-4xl font-bold text-foreground mb-2">PolicyAi</h1>
            <p className="text-lg text-muted-foreground mb-1">for Human Habitat</p>
            <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              Secure Policy Management & Compliance
            </p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <AuthForm />
        </motion.div>

        <motion.p
          className="text-center text-xs text-muted-foreground mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Developed by{' '}
          <a
            href="https://coralshades.com.au"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            CoralShades
          </a>
        </motion.p>
      </motion.div>
    </div>
  );
};

export default Auth;