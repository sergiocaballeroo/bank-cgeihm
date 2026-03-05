export type Screen = 
  | 'WELCOME' 
  | 'MAIN_MENU' 
  | 'WITHDRAW_SELECT' 
  | 'WITHDRAW_OTHER' 
  | 'WITHDRAW_CONFIRM' 
  | 'WITHDRAW_RESULT' 
  | 'BALANCE' 
  | 'DEPOSIT_INPUT' 
  | 'DEPOSIT_CONFIRM' 
  | 'DEPOSIT_RESULT' 
  | 'CANCEL_CONFIRM'
  | 'CARDLESS_METHOD'
  | 'CARDLESS_QR'
  | 'CARDLESS_MANUAL'
  | 'CARDLESS_CONFIRM'
  | 'CARDLESS_RESULT';

export interface TransactionState {
  currentScreen: Screen;
  previousScreen?: Screen;
  amount: number;
  destinationAccount: string;
  reference: string;
  balance: number;
  error: string | null;
  isSuccess: boolean;
}
