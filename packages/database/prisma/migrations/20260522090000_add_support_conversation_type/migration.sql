-- Extend the communication bounded context with support conversations.
ALTER TYPE "ConversationType" ADD VALUE IF NOT EXISTS 'SUPPORT';
