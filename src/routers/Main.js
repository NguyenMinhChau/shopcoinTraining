/* eslint-disable prettier/prettier */
import {
  BuyCoin,
  Contact,
  ChangePwd,
  CreateDeposits,
  CreateWithdraw,
  ForgotPwd,
  Login,
  ProfilePayment,
  Register,
  SellCoin,
  SellHistory,
  ResetPwd,
  SingleDeposits,
  SingleWithdraw,
  UploadDoument,
} from '../layouts';
import {Routers} from '../navigation';

const routersMain = {
  Login: 'Login',
  Register: 'Register',
  ForgotPassword: 'ForgotPassword',
  CreateDeposits: 'Create Deposits',
  SingleDeposits: 'Single Deposits',
  CreateWithdraw: 'Create Withdraw',
  SingleWithdraw: 'Single Withdraw',
  ProfilePayment: 'Profile Payment',
  UploadDoument: 'Upload Document',
  BuyCoin: 'Buy Coin',
  Contact: 'Contact',
  SellCoin: 'Sell Coin',
  ResetPwd: 'Reset Password',
  SellHistory: 'Sell History',
  ChangePwd: 'Change Password',
  Main: 'Main',
};
const MainObject = [
  {
    name: routersMain.Login,
    component: Login,
    options: 'headerNull',
  },
  {
    name: routersMain.Register,
    component: Register,
    options: 'headerNull',
  },
  {
    name: routersMain.ForgotPassword,
    component: ForgotPwd,
    options: 'headerNull',
  },
  {
    name: routersMain.CreateDeposits,
    component: CreateDeposits,
    options: 'custom',
  },
  {
    name: routersMain.SingleDeposits,
    component: SingleDeposits,
    options: 'custom',
  },
  {
    name: routersMain.CreateWithdraw,
    component: CreateWithdraw,
    options: 'custom',
  },
  {
    name: routersMain.SingleWithdraw,
    component: SingleWithdraw,
    options: 'custom',
  },
  {
    name: routersMain.ProfilePayment,
    component: ProfilePayment,
    options: 'custom',
  },
  {
    name: routersMain.UploadDoument,
    component: UploadDoument,
    options: 'custom',
  },
  {
    name: routersMain.BuyCoin,
    component: BuyCoin,
    options: 'custom',
  },
  {
    name: routersMain.Contact,
    component: Contact,
    options: 'custom',
  },
  {
    name: routersMain.SellCoin,
    component: SellCoin,
    options: 'custom',
  },
  {
    name: routersMain.ResetPwd,
    component: ResetPwd,
    options: 'custom',
  },
  {
    name: routersMain.SellHistory,
    component: SellHistory,
    options: 'custom',
  },
  {
    name: routersMain.ChangePwd,
    component: ChangePwd,
    options: 'custom',
  },
  {
    name: routersMain.Main,
    component: Routers,
  },
];

export default MainObject;
