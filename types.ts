export enum TransactionType {
  INCOME = 'INCOME',           // دخل
  EXPENSE = 'EXPENSE',         // مصروف
  DEBT_OWED_TO_ME = 'DEBT_IN', // دائن (لي)
  DEBT_OWED_BY_ME = 'DEBT_OUT',// مدين (علي)
  CREDIT_SPEND = 'CREDIT',     // صرف بالفيزا (deprecated logic, moved to accounts)
  SAVING = 'SAVING'            // تحويش
}

export interface PaymentAccount {
  id: string;
  name: string;
  type: 'CASH' | 'BANK' | 'WALLET';
  isDefault?: boolean;
}

export interface SavingGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  color: string;
  icon?: string;
}

export interface Budget {
  category: string;
  limit: number;
}

export interface Transaction {
  id: string;
  amount: number;
  description: string;
  category: string;
  type: TransactionType;
  date: string;
  isPaid?: boolean; // For debts
  reminderDate?: string; // ISO Date YYYY-MM-DD
  accountId: string; // Link to PaymentAccount
  goalId?: string; // Link to SavingGoal
}

export interface AIParsedResult {
  amount: number;
  category: string;
  description: string;
  type: TransactionType;
}

export type AICommandType = 'TRANSACTION' | 'BUDGET' | 'GOAL' | 'UNKNOWN';

export interface AICommandResult {
  action: AICommandType;
  data: any;
  message: string; // Human readable feedback
}

export interface WeeklySummary {
  totalIncome: number;
  totalExpense: number;
  net: number;
  byCategory: Record<string, number>;
}