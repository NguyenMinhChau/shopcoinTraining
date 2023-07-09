import React from 'react';
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';
import className from 'classnames/bind';
import { useAppContext } from '../../utils';
import { actions } from '../../app/';
import routers from '../../routers/routers';
import { Icons } from '../../components';
import styles from './Sidebar.module.css';

const cx = className.bind(styles);
const LIST_SIDEBAR = [
	{
		name: 'Dashboard',
		path: routers.dashboard,
		icon: <Icons.DashboardIcon className={`${cx('custom-icon')}`} />,
	},
	{
		name: 'Payment',
		path: routers.payment,
		icon: <Icons.PaymentIcon className={`${cx('custom-icon')}`} />,
	},
	{
		name: 'Rate',
		path: routers.rate,
		icon: <Icons.RateIcon className={`${cx('custom-icon')}`} />,
	},
	{
		name: 'Settings Coin',
		path: routers.settingCoin,
		icon: <Icons.SettingIcon className={`${cx('custom-icon')}`} />,
	},
	{
		name: 'Coin Inactive',
		path: routers.coinInactive,
		icon: <Icons.BlockUserIcon className={`${cx('custom-icon')}`} />,
	},
	{
		name: 'Deposits',
		path: routers.deposits,
		icon: <Icons.DepositsIcon className={`${cx('custom-icon')}`} />,
	},
	{
		name: 'Withdraws',
		path: routers.withdraw,
		icon: <Icons.WithdrawIcon className={`${cx('custom-icon')}`} />,
	},
	{
		name: 'Buy',
		path: routers.buy,
		icon: <Icons.BuyIcon className={`${cx('custom-icon')}`} />,
	},
	{
		name: 'Sell',
		path: routers.sell,
		icon: <Icons.SellIcon className={`${cx('custom-icon')}`} />,
	},
	{
		name: 'Change Coin',
		path: routers.changeCoin,
		icon: <Icons.ChangeCoinIcon className={`${cx('custom-icon')}`} />,
	},
	{
		name: 'User',
		path: routers.user,
		icon: <Icons.UserIcon className={`${cx('custom-icon')}`} />,
	},
];
const LIST_SIDEBAR_USER = [
	{
		name: 'Home Page',
		path: routers.homeUser,
		icon: <Icons.HomePageIcon className={`${cx('custom-icon')}`} />,
	},
	{
		name: 'My Coin',
		path: routers.myCoinUser,
		icon: <Icons.MyCoinIcon className={`${cx('custom-icon')}`} />,
	},
	{
		name: 'Buy History',
		path: routers.buyHistoryUser,
		icon: <Icons.HistoryIcon className={`${cx('custom-icon')}`} />,
	},
	{
		name: 'Sell History',
		path: routers.sellHistoryUser,
		icon: <Icons.HistoryIcon className={`${cx('custom-icon')}`} />,
	},
	{
		name: 'Deposits',
		path: routers.depositUser,
		icon: <Icons.DepositsIcon className={`${cx('custom-icon')}`} />,
	},
	{
		name: 'Withdraws',
		path: routers.withdrawUser,
		icon: <Icons.WithdrawIcon className={`${cx('custom-icon')}`} />,
	},
	{
		name: 'Profile',
		path: routers.profileUser,
		icon: <Icons.ProfileIcon className={`${cx('custom-icon')}`} />,
	},
	{
		name: 'Contact',
		path: routers.contactUser,
		icon: <Icons.ContactIcon className={`${cx('custom-icon')}`} />,
	},
	{
		name: 'Live Chat',
		path: routers.liveChatUser,
		icon: <Icons.LiveChatIcon className={`${cx('custom-icon')}`} />,
	},
];

function Sidebar({ className }) {
	const { state, dispatch } = useAppContext();
	const { currentUser, isMenuList } = state.set;
	const classed = cx(
		'sidebar-container',
		className,
		!isMenuList && 'sidebar-none',
	);
	const closeIsMenu = () => {
		dispatch(
			actions.setData({
				isMenuList: false,
			}),
		);
	};
	const handleClick = () => {
		dispatch(
			actions.setData({
				// ...state.set,
				isMenuList: false,
				datas: {
					...state.set.datas,
					dataBlacklistUser: [],
				},
				pagination: {
					page: 1,
					show: 10,
				},
				searchValues: {
					dateFrom: '',
					dateTo: '',
					dashboard: '',
					userBalance: '',
					payment: '',
					rate: '',
					settingCoin: '',
					deposits: '',
					changeCoin: '',
					withdraw: '',
					buy: '',
					sell: '',
					user: '',
					coin: '',
					bank: '',
					userBlacklist: '',
					buyHistory: '',
					sellHistory: '',
					depositUser: '',
					withdrawUser: '',
				},
			}),
		);
	};
	return (
		<div className={classed}>
			<div className={`${cx('close-btn')}`} onClick={closeIsMenu}>
				<Icons.CloseIcon />
			</div>
			{(currentUser?.rule === 'user'
				? LIST_SIDEBAR_USER
				: LIST_SIDEBAR
			).map((item, index) => (
				<NavLink
					onClick={handleClick}
					to={item.path}
					className={(nav) =>
						cx('menu-item', {
							active: nav.isActive,
						})
					}
					key={index}
				>
					{item.icon}
					<span className={cx('title')}>{item.name}</span>
				</NavLink>
			))}
		</div>
	);
}
Sidebar.propTypes = {
	className: PropTypes.string,
};
export default Sidebar;
