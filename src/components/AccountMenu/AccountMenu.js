/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import className from 'classnames/bind';
import {
	Avatar,
	Divider,
	IconButton,
	ListItemIcon,
	Menu,
	MenuItem,
	Tooltip,
	Box,
} from '@mui/material';
import { Logout, Settings } from '@mui/icons-material';
import SupervisedUserCircleIcon from '@mui/icons-material/SupervisedUserCircle';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { Link, useNavigate } from 'react-router-dom';
import { useAppContext, axiosUtils, numberUtils } from '../../utils';
import { SnackbarCp } from '../';
import { actions } from '../../app/';
import styles from './AccountMenu.module.css';
import { LogoutSV } from '../../services/authen';
import routers from '../../routers/routers';

const cx = className.bind(styles);

function AccountMenu({ className }) {
	const { state, dispatch } = useAppContext();
	const { accountMenu, currentUser } = state.set;
	const [user, setUser] = React.useState(null);
	const [snackbar, setSnackbar] = useState({
		open: false,
		type: '',
		message: '',
	});
	const handleCloseSnackbar = (event, reason) => {
		if (reason === 'clickaway') {
			return;
		}
		setSnackbar({
			...snackbar,
			open: false,
		});
	};
	const getUser = async () => {
		const res = await axiosUtils.adminGet(`user/${currentUser?.id}`);
		setUser(res.metadata);
	};
	React.useEffect(() => {
		getUser();
	}, []);
	const open = Boolean(accountMenu);
	const history = useNavigate();
	const handleClickMenu = (e) => {
		dispatch(
			actions.setData({
				...state.set,
				accountMenu: e.currentTarget,
			}),
		);
	};
	const handleCloseMenu = () => {
		dispatch(
			actions.setData({
				...state.set,
				accountMenu: null,
			}),
		);
	};
	const handleLogout = () => {
		LogoutSV({
			id: currentUser?.id,
			dispatch,
			history,
			setSnackbar,
		});
	};
	const classed = cx('accountMenu-container', className);
	const avatarPlaceholder = '/svgs/logo.svg';
	return (
		<>
			<SnackbarCp
				openSnackbar={snackbar.open}
				handleCloseSnackbar={handleCloseSnackbar}
				messageSnackbar={snackbar.message}
				typeSnackbar={snackbar.type}
			/>
			<Box className={classed}>
				<Tooltip title="">
					<IconButton
						onClick={handleClickMenu}
						size="small"
						sx={{ ml: 1 }}
						aria-controls={open ? 'account-menu' : undefined}
						aria-haspopup="true"
						aria-expanded={open ? 'true' : undefined}
					>
						<Avatar
							sx={{ width: 30, height: 30 }}
							src={currentUser.avatar || avatarPlaceholder}
						></Avatar>
					</IconButton>
				</Tooltip>
			</Box>
			<Menu
				anchorEl={accountMenu}
				id="account-menu"
				open={open}
				onClose={handleCloseMenu}
				onClick={handleCloseMenu}
				PaperProps={{
					elevation: 0,
					sx: {
						overflow: 'visible',
						filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
						mt: 1.5,
						'& .MuiAvatar-root': {
							width: 32,
							height: 32,
							ml: -0.5,
							mr: 1,
						},
						'&:before': {
							content: '""',
							display: 'block',
							position: 'absolute',
							top: 0,
							right: 14,
							width: 10,
							height: 10,
							bgcolor: 'background.paper',
							transform: 'translateY(-50%) rotate(45deg)',
							zIndex: 0,
						},
					},
				}}
				transformOrigin={{ horizontal: 'right', vertical: 'top' }}
				anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
			>
				<MenuItem>
					<Avatar src={currentUser.avatar || avatarPlaceholder} />{' '}
					{currentUser.username}
				</MenuItem>
				<Divider />
				<MenuItem>
					Your Wallet:{' '}
					{numberUtils.coinUSD(user?.Wallet?.balance || 0)}
				</MenuItem>
				{/* {currentUser?.rule === 'admin' && (
					<>
						<MenuItem>
							<Link to={routers.profileUser}>
								<ListItemIcon>
									<SupervisedUserCircleIcon fontSize="small" />
								</ListItemIcon>
								<span>My Coin Account</span>
							</Link>
						</MenuItem>
						<MenuItem>
							<Link to={routers.dashboard}>
								<ListItemIcon>
									<AdminPanelSettingsIcon fontSize="small" />
								</ListItemIcon>
								<span>Adminitration</span>
							</Link>
						</MenuItem>
					</>
				)} */}
				<MenuItem onClick={handleLogout}>
					<ListItemIcon>
						<Logout fontSize="small" />
					</ListItemIcon>
					Logout
				</MenuItem>
			</Menu>
		</>
	);
}

AccountMenu.propTypes = {
	className: PropTypes.string,
};

export default AccountMenu;
