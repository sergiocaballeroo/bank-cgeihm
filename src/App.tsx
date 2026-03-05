import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CreditCard, 
  ArrowLeft, 
  X, 
  DollarSign, 
  Wallet, 
  Send, 
  CheckCircle2, 
  AlertCircle,
  ChevronRight,
  History,
  QrCode,
  Key,
  Smartphone,
  Landmark,
  Printer
} from 'lucide-react';
import { Screen, TransactionState } from './types';

const INITIAL_BALANCE = 15420.50;

export default function App() {
  const [state, setState] = useState<TransactionState>({
    currentScreen: 'WELCOME',
    amount: 0,
    destinationAccount: '',
    reference: '',
    balance: INITIAL_BALANCE,
    error: null,
    isSuccess: false,
  });

  const [cardlessData, setCardlessData] = useState({
    withdrawalNumber: '',
    securityKey: '',
  });

  const [processing, setProcessing] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [showInsufficientFunds, setShowInsufficientFunds] = useState(false);

  // Inactivity timeout: 1 minute (60,000 ms)
  useEffect(() => {
    if (state.currentScreen === 'WELCOME') return;

    let timeoutId: NodeJS.Timeout;

    const resetTimer = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        resetTransaction();
      }, 60000); // 1 minute
    };

    // Initial timer
    resetTimer();

    // Event listeners for activity
    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click'];
    const handleActivity = () => resetTimer();

    events.forEach(event => document.addEventListener(event, handleActivity));

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      events.forEach(event => document.removeEventListener(event, handleActivity));
    };
  }, [state.currentScreen]);

  const navigateTo = (screen: Screen) => {
    setState(prev => ({ 
      ...prev, 
      previousScreen: prev.currentScreen,
      currentScreen: screen,
      error: null 
    }));
  };

  const resetTransaction = () => {
    setState(prev => ({
      currentScreen: 'WELCOME',
      amount: 0,
      destinationAccount: '',
      reference: '',
      balance: prev.balance, // Keep the simulated balance
      error: null,
      isSuccess: false,
    }));
    setCardlessData({
      withdrawalNumber: '',
      securityKey: '',
    });
    setIsPrinting(false);
    setShowReceipt(false);
    setShowInsufficientFunds(false);
  };

  const goToMainMenu = () => {
    setState(prev => ({
      ...prev,
      currentScreen: 'MAIN_MENU',
      amount: 0,
      destinationAccount: '',
      reference: '',
      error: null,
      isSuccess: false,
    }));
    setCardlessData({
      withdrawalNumber: '',
      securityKey: '',
    });
    setIsPrinting(false);
  };

  const handlePrint = async () => {
    setIsPrinting(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsPrinting(false);
    setShowReceipt(true);
    
    // After showing receipt, user must close it manually
    // setTimeout removed
  };

  const handleWithdraw = (amount: number) => {
    if (amount <= 0) {
      setState(prev => ({ ...prev, error: 'Ingrese un monto mayor a $0' }));
      return;
    }
    if (amount > state.balance) {
      setShowInsufficientFunds(true);
      return;
    }
    if (amount % 100 !== 0) {
      setState(prev => ({ ...prev, error: 'El monto debe ser múltiplo de $100' }));
      return;
    }
    setState(prev => ({ ...prev, amount }));
    navigateTo('WITHDRAW_CONFIRM');
  };

  const confirmWithdraw = async () => {
    setProcessing(true);
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    setProcessing(false);
    setState(prev => ({
      ...prev,
      balance: prev.balance - prev.amount,
      isSuccess: true,
      currentScreen: 'WITHDRAW_RESULT'
    }));
  };

  const handleCardlessManual = () => {
    if (cardlessData.withdrawalNumber.length < 8) {
      setState(prev => ({ ...prev, error: 'Número de retiro inválido (mínimo 8 dígitos)' }));
      return;
    }
    if (cardlessData.securityKey.length < 4) {
      setState(prev => ({ ...prev, error: 'Clave de seguridad inválida (4 dígitos)' }));
      return;
    }
    // Simulate a fixed amount for cardless withdrawal
    setState(prev => ({ ...prev, amount: 500 }));
    navigateTo('CARDLESS_CONFIRM');
  };

  const confirmCardless = async () => {
    setProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 3500));
    setProcessing(false);
    setState(prev => ({
      ...prev,
      isSuccess: true,
      currentScreen: 'CARDLESS_RESULT'
    }));
  };

  const handleDepositNext = () => {
    if (state.destinationAccount.length < 10 || state.destinationAccount.length > 18) {
      setState(prev => ({ ...prev, error: 'Cuenta destino no válida (10-18 dígitos)' }));
      return;
    }
    if (state.amount <= 0) {
      setState(prev => ({ ...prev, error: 'Monto inválido, ingresa un monto mayor a 0' }));
      return;
    }
    if (state.amount > state.balance) {
      setShowInsufficientFunds(true);
      return;
    }
    navigateTo('DEPOSIT_CONFIRM');
  };

  const confirmDeposit = async () => {
    if (state.destinationAccount.length < 10 || state.destinationAccount.length > 18) {
      setState(prev => ({ ...prev, error: 'Cuenta destino no válida (10-18 dígitos)' }));
      return;
    }
    if (state.amount <= 0) {
      setState(prev => ({ ...prev, error: 'Monto inválido, ingresa un monto mayor a 0' }));
      return;
    }

    if (state.amount > state.balance) {
      setShowInsufficientFunds(true);
      return;
    }

    setProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    setProcessing(false);
    setState(prev => ({
      ...prev,
      balance: prev.balance - prev.amount,
      isSuccess: true,
      currentScreen: 'DEPOSIT_RESULT'
    }));
  };

  const maskAccount = (acc: string) => {
    if (acc.length < 4) return acc;
    const masked = '****' + acc.slice(-4);
    return masked;
  };

  const formatAccountNumber = (val: string) => {
    const digits = val.replace(/\D/g, '');
    const groups = digits.match(/.{1,4}/g);
    return groups ? groups.join(' ') : digits;
  };

  const formatCurrency = (val: number) => {
    const formatted = new Intl.NumberFormat('en-US', { 
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(val);
    return `$${formatted}`;
  };

  const BankLogo = () => (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 bg-bank-primary rounded-xl flex items-center justify-center shadow-lg shadow-bank-primary/20">
        <Landmark className="text-white" size={24} />
      </div>
      <div className="flex flex-col">
        <span className="text-xl font-black text-slate-800 tracking-tighter leading-none">BANCO</span>
        <span className="text-bank-primary font-bold text-[10px] tracking-[0.2em] leading-none mt-0.5">ESTELAR</span>
      </div>
    </div>
  );

  const ReceiptModal = () => (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[60] p-6 overflow-y-auto"
    >
      <motion.div 
        initial={{ y: 100, opacity: 0, scale: 0.9 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        className="bg-white w-full max-w-sm rounded-[32px] overflow-hidden shadow-2xl flex flex-col my-auto"
      >
        <div className="bg-slate-50 p-8 border-b-2 border-dashed border-slate-200 flex flex-col items-center text-center">
          <BankLogo />
          <div className="mt-6 space-y-1">
            <p className="text-xs text-slate-400 font-mono uppercase tracking-widest">Comprobante de Operación</p>
            <p className="text-sm font-mono text-slate-600">ATM-042-MX | {new Date().toLocaleDateString()}</p>
          </div>
        </div>
        
        <div className="p-8 space-y-6 flex-1">
          <div className="space-y-1">
            <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Tipo de Operación</p>
            <p className="text-xl font-bold text-slate-800">
              {state.currentScreen.includes('WITHDRAW') ? 'Retiro de Efectivo' : 
               state.currentScreen.includes('DEPOSIT') ? 'Depósito a Tercero' : 
               state.currentScreen.includes('CARDLESS') ? 'Retiro sin Tarjeta' : 'Consulta de Saldo'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Monto</p>
              <p className="text-2xl font-black text-bank-primary">{formatCurrency(state.amount)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Estado</p>
              <p className="text-lg font-bold text-emerald-500">EXITOSO</p>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Referencia:</span>
              <span className="font-mono font-bold text-slate-600">#{Math.floor(Math.random() * 900000 + 100000)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Saldo Disponible:</span>
              <span className="font-mono font-bold text-slate-800">{formatCurrency(state.balance)}</span>
            </div>
          </div>
        </div>

        <div className="p-6 bg-slate-50 text-center flex flex-col items-center gap-4">
          <p className="text-xs text-slate-400 font-medium italic">Gracias por confiar en Banco Estelar</p>
          <button 
            onClick={() => {
              setShowReceipt(false);
              resetTransaction();
            }}
            className="text-bank-primary font-bold text-sm hover:underline"
          >
            Cerrar y Salir
          </button>
        </div>
      </motion.div>
    </motion.div>
  );

  // Helper components
  const ScreenHeader = ({ title, showBack = true }: { title: string, showBack?: boolean }) => (
    <div className="flex items-center justify-between mb-10 mt-10">
      <div className="flex items-center gap-6">
        {showBack && (
          <button 
            onClick={() => navigateTo(state.previousScreen || 'MAIN_MENU')}
            className="p-3 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-2xl transition-all active:scale-90"
          >
            <ArrowLeft size={24} />
          </button>
        )}
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">{title}</h1>
      </div>
    </div>
  );

  const LoadingOverlay = () => (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 bg-white/90 backdrop-blur-md flex flex-col items-center justify-center z-50"
    >
      <div className="relative w-24 h-24 mb-6">
        <div className="absolute inset-0 border-4 border-bank-soft rounded-full"></div>
        <div className="absolute inset-0 border-4 border-bank-primary border-t-transparent rounded-full animate-spin"></div>
        <div className="absolute inset-4 bg-bank-soft/30 rounded-full animate-soft-pulse"></div>
      </div>
      <p className="text-2xl font-bold text-slate-800 animate-pulse">Procesando operación</p>
      <p className="text-slate-500 mt-2">Por favor, espere un momento...</p>
    </motion.div>
  );

  const InsufficientFundsModal = () => (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[70] p-6"
    >
      <motion.div 
        initial={{ y: 50, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        className="bg-white w-full max-w-md rounded-[40px] p-10 shadow-2xl text-center flex flex-col items-center"
      >
        <div className="w-24 h-24 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-8">
          <AlertCircle size={56} strokeWidth={2.5} />
        </div>
        
        <h2 className="text-4xl font-black text-slate-800 mb-4 tracking-tight">Fondos Insuficientes</h2>
        
        <p className="text-slate-500 text-xl mb-8 leading-relaxed">
          Lo sentimos, no cuenta con saldo suficiente para completar esta transacción.
        </p>

        <div className="w-full bg-slate-50 rounded-3xl p-6 mb-10 border border-slate-100">
          <p className="text-slate-400 text-sm uppercase font-bold tracking-widest mb-2">Su saldo disponible es:</p>
          <p className="text-4xl font-black text-bank-primary">{formatCurrency(state.balance)}</p>
        </div>

        <button 
          onClick={() => setShowInsufficientFunds(false)}
          className="atm-button atm-button-primary w-full justify-center py-6 text-2xl rounded-2xl shadow-lg shadow-bank-primary/20"
        >
          Entendido
        </button>
      </motion.div>
    </motion.div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-10 bg-[#f0f2f5] overflow-y-auto">
      <div className="w-full max-w-5xl min-h-[700px] h-auto relative atm-screen rounded-[40px] flex flex-col p-8 md:p-12 my-8">
        
        {/* Top Header with Logo */}
        <div className="absolute top-8 left-12 z-20">
          <BankLogo />
        </div>

        {state.currentScreen !== 'WELCOME' && state.currentScreen !== 'CANCEL_CONFIRM' && (
          <button 
            onClick={() => navigateTo('CANCEL_CONFIRM')}
            className="absolute top-8 right-12 z-20 p-3 bg-rose-50 text-rose-500 rounded-2xl hover:bg-rose-100 transition-all font-bold flex items-center gap-2 shadow-sm border border-rose-100"
          >
            <X size={24} />
            <span className="hidden md:inline">Cancelar</span>
          </button>
        )}

        <AnimatePresence>
          {processing && <LoadingOverlay />}
          {showReceipt && <ReceiptModal />}
          {showInsufficientFunds && <InsufficientFundsModal />}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {state.currentScreen === 'WELCOME' && (
            <motion.div 
              key="welcome"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ type: "spring", duration: 0.6 }}
              className="flex-1 flex flex-col items-center justify-center text-center"
            >
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="mb-10 p-8 bg-bank-soft rounded-[40px]"
              >
                <Landmark size={100} className="text-bank-primary" />
              </motion.div>
              <h1 className="text-6xl font-extrabold mb-6 tracking-tight text-slate-900">
                Bienvenido a <span className="text-bank-primary">Banco Estelar</span>
              </h1>
              <p className="text-slate-500 text-2xl mb-16 max-w-lg mx-auto leading-relaxed">
                Su seguridad es nuestra prioridad. Por favor, inicie su sesión.
              </p>
              
              <div className="flex flex-col gap-5 w-full max-w-sm">
                <button 
                  onClick={() => navigateTo('MAIN_MENU')}
                  className="atm-button atm-button-primary justify-center py-7 text-2xl rounded-3xl"
                >
                  Iniciar Operación
                </button>
                <button 
                  onClick={() => navigateTo('CARDLESS_METHOD')}
                  className="atm-button atm-button-secondary justify-between px-8 py-5 rounded-2xl flex items-center w-full"
                >
                  <span className="text-xl font-semibold">Retiro sin Tarjeta</span>
                  <Smartphone size={24} />
                </button>
                <button 
                  className="atm-button atm-button-secondary justify-center py-4 rounded-xl text-slate-400 text-sm"
                  onClick={() => window.location.reload()}
                >
                  Finalizar Sesión
                </button>
              </div>
            </motion.div>
          )}

          {state.currentScreen === 'CARDLESS_METHOD' && (
            <motion.div key="cardless-method" className="flex-1 flex flex-col">
              <ScreenHeader title="Retiro sin Tarjeta" />
              <div className="flex-1 flex flex-col items-center justify-center">
                <p className="text-slate-500 text-2xl mb-12 text-center max-w-md leading-relaxed">
                  Seleccione el método para realizar su retiro sin tarjeta
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-2xl">
                  <button 
                    onClick={() => navigateTo('CARDLESS_QR')}
                    className="atm-button atm-button-secondary h-48 rounded-[40px] flex-col justify-center gap-4"
                  >
                    <div className="p-6 bg-bank-primary text-white rounded-3xl">
                      <QrCode size={48} />
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-bold">Código QR</p>
                      <p className="text-slate-500 text-sm font-normal">Escanee desde su App</p>
                    </div>
                  </button>
                  <button 
                    onClick={() => navigateTo('CARDLESS_MANUAL')}
                    className="atm-button atm-button-secondary h-48 rounded-[40px] flex-col justify-center gap-4"
                  >
                    <div className="p-6 bg-bank-primary text-white rounded-3xl">
                      <Key size={48} />
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-bold">Clave de Retiro</p>
                      <p className="text-slate-500 text-sm font-normal">Ingrese sus códigos</p>
                    </div>
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {state.currentScreen === 'CARDLESS_QR' && (
            <motion.div key="cardless-qr" className="flex-1 flex flex-col items-center justify-center text-center">
              <ScreenHeader title="Escaneo de Código QR" />
              <div className="bg-white p-10 rounded-[48px] border-4 border-bank-soft mb-10 animate-float">
                <div className="bg-slate-50 p-6 rounded-3xl border-2 border-dashed border-bank-primary/30">
                  <QrCode size={240} className="text-slate-800" />
                </div>
              </div>
              <p className="text-slate-500 text-2xl mb-12 max-w-md leading-relaxed">
                Abra su aplicación bancaria y escanee el código QR mostrado en pantalla
              </p>
              <button 
                onClick={confirmCardless}
                className="atm-button atm-button-primary px-20 py-7 text-2xl rounded-3xl shadow-xl shadow-bank-primary/20"
              >
                Simular Escaneo
              </button>
            </motion.div>
          )}

          {state.currentScreen === 'CARDLESS_MANUAL' && (
            <motion.div key="cardless-manual" className="flex-1 flex flex-col">
              <ScreenHeader title="Ingrese sus Códigos" />
              <div className="max-w-2xl mx-auto w-full mt-4 space-y-8">
                <div>
                  <label className="block text-slate-500 mb-3 font-bold text-lg">Número de Retiro (12 dígitos)</label>
                  <input 
                    type="text"
                    maxLength={12}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-6 px-8 text-4xl font-mono focus:border-bank-primary focus:bg-white outline-none transition-all text-center tracking-[0.5em]"
                    placeholder="000000000000"
                    onChange={(e) => setCardlessData(prev => ({ ...prev, withdrawalNumber: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-3 font-bold text-lg">Clave de Seguridad (4 dígitos)</label>
                  <input 
                    type="password"
                    maxLength={4}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-6 px-8 text-4xl font-mono focus:border-bank-primary focus:bg-white outline-none transition-all text-center tracking-[1em]"
                    placeholder="****"
                    onChange={(e) => setCardlessData(prev => ({ ...prev, securityKey: e.target.value }))}
                  />
                </div>

                {state.error && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-5 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-4 text-rose-600"
                  >
                    <AlertCircle size={24} />
                    <span className="font-bold text-lg">{state.error}</span>
                  </motion.div>
                )}

                <button 
                  onClick={handleCardlessManual}
                  className="atm-button atm-button-primary w-full mt-6 justify-center py-8 text-3xl rounded-[32px] shadow-xl shadow-bank-primary/20"
                >
                  Continuar
                </button>
              </div>
            </motion.div>
          )}

          {state.currentScreen === 'CARDLESS_CONFIRM' && (
            <motion.div key="cardless-confirm" className="flex-1 flex flex-col items-center justify-center text-center">
              <ScreenHeader title="Confirmar Retiro sin Tarjeta" />
              <div className="bg-bank-soft/50 p-16 rounded-[48px] border-2 border-bank-soft mb-16 w-full max-w-2xl">
                <p className="text-slate-500 text-2xl mb-4 font-medium">Monto autorizado</p>
                <p className="text-8xl font-black text-bank-primary tracking-tighter">{formatCurrency(state.amount)}</p>
                <div className="mt-8 pt-8 border-t border-bank-soft flex justify-center gap-12">
                  <div>
                    <p className="text-slate-400 text-sm uppercase font-bold">Referencia</p>
                    <p className="text-xl font-mono">{cardlessData.withdrawalNumber || 'QR-SCAN'}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-8 w-full max-w-xl">
                <button 
                  onClick={() => navigateTo('CARDLESS_METHOD')}
                  className="atm-button atm-button-secondary flex-1 justify-center py-6 text-xl rounded-3xl"
                >
                  Cancelar
                </button>
                <button 
                  onClick={confirmCardless}
                  className="atm-button atm-button-primary flex-1 justify-center py-8 text-2xl rounded-3xl shadow-xl shadow-bank-primary/20"
                >
                  Confirmar Retiro
                </button>
              </div>
            </motion.div>
          )}

          {state.currentScreen === 'CARDLESS_RESULT' && (
            <motion.div key="cardless-result" className="flex-1 flex flex-col items-center justify-center text-center">
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", damping: 12 }}
                className="mb-10 text-emerald-500 bg-emerald-50 p-10 rounded-full"
              >
                <CheckCircle2 size={120} />
              </motion.div>
              <h1 className="text-5xl font-extrabold mb-6 text-slate-900">¡Retiro Exitoso!</h1>
              <p className="text-slate-500 text-2xl mb-16 max-w-md mx-auto leading-relaxed">
                Su retiro sin tarjeta ha sido procesado. Por favor, retire su efectivo.
              </p>
              
              <div className="bg-slate-50 p-10 rounded-[32px] mb-12 w-full max-w-md border border-slate-100">
                <div className="flex justify-between mb-2">
                  <span className="text-slate-500 text-xl">Monto:</span>
                  <span className="font-bold text-2xl text-slate-800">{formatCurrency(state.amount)}</span>
                </div>
              </div>

              <div className="flex flex-col gap-4 w-full max-w-md">
                <div className="flex gap-4">
                  <button 
                    onClick={handlePrint}
                    disabled={isPrinting}
                    className={`atm-button ${isPrinting ? 'bg-slate-200 text-slate-400' : 'atm-button-secondary'} flex-1 justify-center gap-2`}
                  >
                    {isPrinting ? (
                      <div className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Printer size={20} />
                    )}
                    <span>{isPrinting ? 'Imprimiendo...' : 'Imprimir Comprobante'}</span>
                  </button>
                  <button 
                    onClick={goToMainMenu}
                    className="atm-button atm-button-secondary flex-1 justify-center"
                  >
                    Realizar otro movimiento
                  </button>
                </div>
                <button 
                  onClick={resetTransaction}
                  className="atm-button atm-button-primary py-6 text-xl rounded-2xl"
                >
                  Finalizar sesión
                </button>
              </div>
            </motion.div>
          )}

          {state.currentScreen === 'MAIN_MENU' && (
            <motion.div 
              key="menu"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ type: "spring", stiffness: 100, damping: 20 }}
              className="flex-1 flex flex-col"
            >
              <ScreenHeader title="¿Qué desea realizar hoy?" showBack={false} />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
                <button 
                  onClick={() => navigateTo('WITHDRAW_SELECT')}
                  className="atm-button atm-button-primary h-32 rounded-3xl"
                >
                  <div className="flex items-center gap-6">
                    <div className="p-4 bg-white/20 rounded-2xl">
                      <Wallet size={32} />
                    </div>
                    <div className="text-left">
                      <p className="text-xl font-bold">Retiro de efectivo</p>
                      <p className="text-white/70 text-sm font-normal">Disponga de su dinero al instante</p>
                    </div>
                  </div>
                  <ChevronRight size={28} />
                </button>
                
                <button 
                  onClick={() => navigateTo('BALANCE')}
                  className="atm-button atm-button-secondary h-32 rounded-3xl"
                >
                  <div className="flex items-center gap-6">
                    <div className="p-4 bg-bank-primary/10 rounded-2xl">
                      <History size={32} />
                    </div>
                    <div className="text-left">
                      <p className="text-xl font-bold">Consulta de saldo</p>
                      <p className="text-bank-primary/70 text-sm font-normal">Revise sus movimientos</p>
                    </div>
                  </div>
                  <ChevronRight size={28} />
                </button>

                <button 
                  onClick={() => navigateTo('DEPOSIT_INPUT')}
                  className="atm-button atm-button-secondary h-32 rounded-3xl md:col-span-2"
                >
                  <div className="flex items-center gap-6">
                    <div className="p-4 bg-bank-primary/10 rounded-2xl">
                      <Send size={32} />
                    </div>
                    <div className="text-left">
                      <p className="text-xl font-bold">Depósito a un tercero</p>
                      <p className="text-bank-primary/70 text-sm font-normal">Transfiera de forma segura y rápida</p>
                    </div>
                  </div>
                  <ChevronRight size={28} />
                </button>
              </div>
            </motion.div>
          )}

          {state.currentScreen === 'WITHDRAW_SELECT' && (
            <motion.div 
              key="withdraw-select"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex-1 flex flex-col"
            >
              <ScreenHeader title="Seleccione el Monto" />
              
              <div className="grid grid-cols-2 gap-8">
                {[100, 200, 500, 1000].map((amt, i) => (
                  <motion.button 
                    key={amt}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    onClick={() => handleWithdraw(amt)}
                    className="atm-button atm-button-secondary justify-center text-4xl py-10 rounded-3xl border-2 border-transparent hover:border-bank-primary/30"
                  >
                    {formatCurrency(amt)}
                  </motion.button>
                ))}
                <button 
                  onClick={() => navigateTo('WITHDRAW_OTHER')}
                  className="atm-button atm-button-primary col-span-2 justify-center text-2xl py-8 rounded-3xl"
                >
                  Otro monto personalizado
                </button>
              </div>
              
              {state.error && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-10 p-5 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-4 text-rose-600"
                >
                  <AlertCircle size={24} />
                  <span className="font-bold text-lg">{state.error}</span>
                </motion.div>
              )}
            </motion.div>
          )}

          {state.currentScreen === 'WITHDRAW_OTHER' && (
            <motion.div key="withdraw-other" className="flex-1 flex flex-col">
              <ScreenHeader title="Ingrese el Monto" />
              <div className="max-w-xl mx-auto w-full mt-12">
                <div className="relative group">
                  <span className="absolute left-8 top-1/2 -translate-y-1/2 text-5xl text-slate-300 group-focus-within:text-bank-primary transition-colors">$</span>
                  <input 
                    type="number"
                    autoFocus
                    step="100"
                    min="0"
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-[32px] py-10 pl-20 pr-8 text-6xl font-bold focus:border-bank-primary focus:bg-white outline-none transition-all text-slate-800"
                    placeholder="0"
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setState(prev => ({ ...prev, amount: val < 0 ? 0 : val }));
                    }}
                  />
                </div>
                <p className="mt-6 text-slate-400 text-center text-lg font-medium">Ingrese múltiplos de $100 para continuar</p>
                
                {state.error && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-8 p-5 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-4 text-rose-600"
                  >
                    <AlertCircle size={24} />
                    <span className="font-bold text-lg">{state.error}</span>
                  </motion.div>
                )}

                <button 
                  onClick={() => handleWithdraw(state.amount)}
                  className="atm-button atm-button-primary w-full mt-16 justify-center py-8 text-3xl rounded-[32px]"
                >
                  Continuar
                </button>
              </div>
            </motion.div>
          )}

          {state.currentScreen === 'WITHDRAW_CONFIRM' && (
            <motion.div key="withdraw-confirm" className="flex-1 flex flex-col items-center justify-center text-center">
              <ScreenHeader title="Confirmar Operación" />
              <div className="bg-bank-soft/50 p-16 rounded-[48px] border-2 border-bank-soft mb-16 w-full max-w-2xl">
                <p className="text-slate-500 text-2xl mb-4 font-medium">Monto a retirar</p>
                <p className="text-8xl font-black text-bank-primary tracking-tighter">{formatCurrency(state.amount)}</p>
              </div>
              
              <div className="flex gap-8 w-full max-w-xl">
                <button 
                  onClick={() => navigateTo('WITHDRAW_SELECT')}
                  className="atm-button atm-button-secondary flex-1 justify-center py-6 text-xl rounded-3xl"
                >
                  Corregir
                </button>
                <button 
                  onClick={confirmWithdraw}
                  className="atm-button atm-button-primary flex-1 justify-center py-8 text-2xl rounded-3xl shadow-xl shadow-bank-primary/20"
                >
                  Confirmar Retiro
                </button>
              </div>
            </motion.div>
          )}

          {state.currentScreen === 'WITHDRAW_RESULT' && (
            <motion.div key="withdraw-result" className="flex-1 flex flex-col items-center justify-center text-center">
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", damping: 12 }}
                className="mb-10 text-emerald-500 bg-emerald-50 p-10 rounded-full"
              >
                <CheckCircle2 size={120} />
              </motion.div>
              <h1 className="text-5xl font-extrabold mb-6 text-slate-900">¡Retiro Exitoso!</h1>
              <p className="text-slate-500 text-2xl mb-16 max-w-md mx-auto leading-relaxed">
                Su transacción ha sido procesada. Por favor, retire su efectivo.
              </p>
              
              <div className="bg-slate-50 p-10 rounded-[32px] mb-12 w-full max-w-md border border-slate-100">
                <div className="flex justify-between mb-6 pb-6 border-b border-slate-200">
                  <span className="text-slate-500 text-xl">Monto:</span>
                  <span className="font-bold text-2xl text-slate-800">{formatCurrency(state.amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 text-xl">Saldo Restante:</span>
                  <span className="font-bold text-2xl text-bank-primary">{formatCurrency(state.balance)}</span>
                </div>
              </div>

              <div className="flex flex-col gap-4 w-full max-w-md">
                <div className="flex gap-4">
                  <button 
                    onClick={handlePrint}
                    disabled={isPrinting}
                    className={`atm-button ${isPrinting ? 'bg-slate-200 text-slate-400' : 'atm-button-secondary'} flex-1 justify-center gap-2`}
                  >
                    {isPrinting ? (
                      <div className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Printer size={20} />
                    )}
                    <span>{isPrinting ? 'Imprimiendo...' : 'Imprimir Comprobante'}</span>
                  </button>
                  <button 
                    onClick={goToMainMenu}
                    className="atm-button atm-button-secondary flex-1 justify-center"
                  >
                    Realizar otro movimiento
                  </button>
                </div>
                <button 
                  onClick={resetTransaction}
                  className="atm-button atm-button-primary py-6 text-xl rounded-2xl"
                >
                  Finalizar sesión
                </button>
              </div>
            </motion.div>
          )}

          {state.currentScreen === 'BALANCE' && (
            <motion.div key="balance" className="flex-1 flex flex-col">
              <ScreenHeader title="Estado de Cuenta" />
              <div className="flex-1 flex flex-col items-center justify-center">
                <div className="bg-white p-16 rounded-[48px] border border-slate-100 shadow-sm w-full max-w-2xl mb-16 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-bank-soft/30 rounded-full -mr-16 -mt-16"></div>
                  <div className="relative z-10">
                    <div className="mb-12 pb-12 border-b border-slate-100">
                      <p className="text-slate-400 text-xl mb-4 font-bold uppercase tracking-widest">Saldo Disponible</p>
                      <p className="text-8xl font-black text-slate-900 tracking-tighter">{formatCurrency(state.balance)}</p>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-slate-400 text-xl font-bold uppercase tracking-widest">Saldo Contable</p>
                      <p className="text-4xl font-bold text-slate-400">{formatCurrency(state.balance + 1200)}</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-8 w-full max-w-xl">
                  <button 
                    onClick={() => navigateTo('MAIN_MENU')}
                    className="atm-button atm-button-secondary flex-1 justify-center py-6 text-xl rounded-3xl"
                  >
                    Realizar otro movimiento
                  </button>
                  <button 
                    onClick={resetTransaction}
                    className="atm-button atm-button-primary flex-1 justify-center py-6 text-xl rounded-3xl"
                  >
                    Finalizar sesión
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {state.currentScreen === 'DEPOSIT_INPUT' && (
            <motion.div key="deposit-input" className="flex-1 flex flex-col">
              <ScreenHeader title="Depósito a Tercero" />
              <div className="max-w-3xl mx-auto w-full mt-4 grid grid-cols-1 gap-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="md:col-span-2">
                    <label className="block text-slate-500 mb-3 font-bold text-lg">Número de Cuenta Destino</label>
                    <input 
                      type="text"
                      maxLength={22} // 18 digits + 4 spaces
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-6 px-8 text-3xl font-mono focus:border-bank-primary focus:bg-white outline-none transition-all"
                      placeholder="0000 0000 0000 0000"
                      value={formatAccountNumber(state.destinationAccount)}
                      onChange={(e) => {
                        const rawValue = e.target.value.replace(/\D/g, '');
                        if (rawValue.length <= 18) {
                          setState(prev => ({ ...prev, destinationAccount: rawValue }));
                        }
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 mb-3 font-bold text-lg">Monto del Depósito</label>
                    <div className="relative">
                      <span className="absolute left-6 top-1/2 -translate-y-1/2 text-3xl text-slate-300">$</span>
                      <input 
                        type="number"
                        min="0"
                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-6 pl-14 px-8 text-3xl font-bold focus:border-bank-primary focus:bg-white outline-none transition-all"
                        placeholder="0"
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setState(prev => ({ ...prev, amount: val < 0 ? 0 : val }));
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-slate-500 mb-3 font-bold text-lg">Referencia / Concepto</label>
                    <input 
                      type="text"
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-6 px-8 text-2xl focus:border-bank-primary focus:bg-white outline-none transition-all"
                      placeholder="Ej. Pago servicios"
                      onChange={(e) => setState(prev => ({ ...prev, reference: e.target.value }))}
                    />
                  </div>
                </div>

                {state.error && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-5 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-4 text-rose-600"
                  >
                    <AlertCircle size={24} />
                    <span className="font-bold text-lg">{state.error}</span>
                  </motion.div>
                )}

                <button 
                  onClick={handleDepositNext}
                  className="atm-button atm-button-primary w-full mt-6 justify-center py-8 text-3xl rounded-[32px] shadow-xl shadow-bank-primary/20"
                >
                  Continuar con el Depósito
                </button>
              </div>
            </motion.div>
          )}

          {state.currentScreen === 'DEPOSIT_CONFIRM' && (
            <motion.div key="deposit-confirm" className="flex-1 flex flex-col items-center justify-center">
              <ScreenHeader title="Verificar Datos" />
              <div className="bg-white p-12 rounded-[48px] border border-slate-100 shadow-sm w-full max-w-xl mb-16">
                <div className="space-y-10">
                  <div className="flex items-center gap-6">
                    <div className="p-4 bg-bank-soft rounded-2xl text-bank-primary">
                      <CreditCard size={32} />
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm uppercase font-black tracking-widest">Cuenta Destino</p>
                      <p className="text-3xl font-mono font-bold text-slate-800">{formatAccountNumber(state.destinationAccount)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="p-4 bg-emerald-50 rounded-2xl text-emerald-600">
                      <DollarSign size={32} />
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm uppercase font-black tracking-widest">Monto a Enviar</p>
                      <p className="text-5xl font-black text-bank-primary">{formatCurrency(state.amount)}</p>
                    </div>
                  </div>
                  {state.reference && (
                    <div className="flex items-center gap-6">
                      <div className="p-4 bg-slate-50 rounded-2xl text-slate-500">
                        <History size={32} />
                      </div>
                      <div>
                        <p className="text-slate-400 text-sm uppercase font-black tracking-widest">Concepto</p>
                        <p className="text-2xl font-medium text-slate-600 italic">"{state.reference}"</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {state.error && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mb-8 p-5 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-4 text-rose-600 w-full max-w-xl"
                >
                  <AlertCircle size={24} />
                  <span className="font-bold text-lg">{state.error}</span>
                </motion.div>
              )}
              
              <div className="flex gap-8 w-full max-w-xl">
                <button 
                  onClick={() => navigateTo('DEPOSIT_INPUT')}
                  className="atm-button atm-button-secondary flex-1 justify-center py-6 text-xl rounded-3xl"
                >
                  Modificar
                </button>
                <button 
                  onClick={confirmDeposit}
                  className="atm-button atm-button-primary flex-1 justify-center py-8 text-2xl rounded-3xl shadow-xl shadow-bank-primary/20"
                >
                  Confirmar Depósito
                </button>
              </div>
            </motion.div>
          )}

          {state.currentScreen === 'DEPOSIT_RESULT' && (
            <motion.div key="deposit-result" className="flex-1 flex flex-col items-center justify-center text-center">
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", damping: 12 }}
                className="mb-10 text-emerald-500 bg-emerald-50 p-10 rounded-full"
              >
                <CheckCircle2 size={120} />
              </motion.div>
              <h1 className="text-5xl font-extrabold mb-6 text-slate-900">¡Depósito Realizado!</h1>
              <p className="text-slate-500 text-2xl mb-16 max-w-md mx-auto leading-relaxed">
                Su transferencia ha sido enviada con éxito.
              </p>
              
              <div className="bg-slate-50 p-10 rounded-[32px] mb-12 w-full max-w-md border border-slate-100">
                <div className="flex justify-between mb-6 pb-6 border-b border-slate-200">
                  <span className="text-slate-500 text-xl">Monto enviado:</span>
                  <span className="font-bold text-2xl text-slate-800">{formatCurrency(state.amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 text-xl">Saldo Actual:</span>
                  <span className="font-bold text-2xl text-bank-primary">{formatCurrency(state.balance)}</span>
                </div>
              </div>

              <div className="flex flex-col gap-4 w-full max-w-md">
                <div className="flex gap-4">
                  <button 
                    onClick={handlePrint}
                    disabled={isPrinting}
                    className={`atm-button ${isPrinting ? 'bg-slate-200 text-slate-400' : 'atm-button-secondary'} flex-1 justify-center gap-2`}
                  >
                    {isPrinting ? (
                      <div className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Printer size={20} />
                    )}
                    <span>{isPrinting ? 'Imprimiendo...' : 'Imprimir Comprobante'}</span>
                  </button>
                  <button 
                    onClick={goToMainMenu}
                    className="atm-button atm-button-secondary flex-1 justify-center"
                  >
                    Realizar otro movimiento
                  </button>
                </div>
                <button 
                  onClick={resetTransaction}
                  className="atm-button atm-button-primary py-6 text-xl rounded-2xl"
                >
                  Finalizar sesión
                </button>
              </div>
            </motion.div>
          )}

          {state.currentScreen === 'CANCEL_CONFIRM' && (
            <motion.div key="cancel-confirm" className="flex-1 flex flex-col items-center justify-center text-center">
              <div className="mb-10 text-rose-500 bg-rose-50 p-10 rounded-full">
                <AlertCircle size={100} />
              </div>
              <h1 className="text-5xl font-extrabold mb-6 text-slate-900">¿Desea cancelar?</h1>
              <p className="text-slate-500 text-2xl mb-16 max-w-lg mx-auto leading-relaxed">
                Si cancela ahora, su sesión se cerrará y no se realizará ninguna operación.
              </p>
              
              <div className="flex gap-8 w-full max-w-xl">
                <button 
                  onClick={() => navigateTo(state.previousScreen || 'MAIN_MENU')}
                  className="atm-button atm-button-secondary flex-1 justify-center py-6 text-xl rounded-3xl"
                >
                  No, continuar
                </button>
                <button 
                  onClick={resetTransaction}
                  className="atm-button atm-button-danger flex-1 justify-center py-8 text-2xl rounded-3xl"
                >
                  Sí, cancelar sesión
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer info */}
        <div className="mt-auto pt-10 flex justify-between items-center border-t border-slate-100 text-slate-400 text-lg font-medium">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.5)]"></div>
            <span>Conexión segura establecida</span>
          </div>
          <div className="font-mono bg-slate-50 px-5 py-2 rounded-full border border-slate-100">
            {new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })} | ATM-042-MX
          </div>
        </div>
      </div>
    </div>
  );
}
