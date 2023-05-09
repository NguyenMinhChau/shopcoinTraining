/* eslint-disable react-hooks/exhaustive-deps */
import React, { Fragment, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { useAppContext } from './utils';
import { DefaultLayout } from './Layouts';
import { actions } from './app/';
import {
	privateRouter,
	publicRouter,
	userRouter,
} from './routers/routerRender';
import routers from './routers/routers';
import { Icons, ProgressLine } from './components';
import axios from 'axios';

function App() {
	const { state, dispatch } = useAppContext();
	const { currentUser } = state.set;
	const [scrollToTop, setScrollToTop] = React.useState(false);
	const [getApp, setGetApp] = React.useState(false);
	const [isLoading, setIsLoading] = React.useState(false);
	const [valueProgress, setValueProgress] = React.useState(0);
	const Routers =
		currentUser?.rule === 'admin' || currentUser?.rule === 'manager'
			? privateRouter
			: currentUser?.rule === 'user'
			? userRouter
			: publicRouter;
	const history = useNavigate();
	const toogleGetApp = (e) => {
		e.stopPropagation();
		setGetApp(!getApp);
	};
	const getAppTrue = (e) => {
		e.stopPropagation();
		setGetApp(true);
	};
	useEffect(() => {
		const handleScrollToTop = () => {
			const heightY = window.scrollY;
			if (heightY > 100) {
				setScrollToTop(true);
			} else {
				setScrollToTop(false);
			}
		};
		window.addEventListener('scroll', handleScrollToTop);
		if (currentUser && currentUser?.rule) {
			dispatch(
				actions.setData({
					...state.set,
					currentUser: currentUser,
				}),
			);
		} else {
			if (
				!currentUser &&
				!!publicRouter.includes(window.location.pathname)
			) {
				history(routers.login);
			} else {
				publicRouter.includes(window.location.pathname);
			}
		}
	}, []);
	const downloadFile = async (url, name) => {
		setIsLoading(true);
		setGetApp(true);
		await axios({
			url: url,
			method: 'GET',
			responseType: 'blob',
			onDownloadProgress: (progressEvent) => {
				const percentCompleted = Math.round(
					(progressEvent.loaded * 100) / progressEvent.total,
				);
				setValueProgress(percentCompleted);
				if (percentCompleted >= 100) {
					setTimeout(() => {
						setIsLoading(false);
						setGetApp(false);
						setValueProgress(0);
					}, 2000);
				}
			},
		})
			.then((res) => {
				const url = window.URL.createObjectURL(res.data);
				const a = document.createElement('a');
				a.href = url;
				a.download = name;
				a.click();
			})
			.catch((err) => {
				console.log(err);
			});
	};
	return (
		<>
			<div className="app">
				<Routes>
					{Routers.map((route, index) => {
						const Layout = route.layout
							? route.layout
							: route.layout === null
							? Fragment
							: DefaultLayout;
						const Page = route.component;
						return (
							<Route
								key={index}
								path={route.path}
								element={
									<Layout>
										<Page />
									</Layout>
								}
							/>
						);
					})}
				</Routes>
				{scrollToTop && (
					<div
						className="scroll-to-top-container"
						onClick={() => {
							window.scrollTo({ top: 0, behavior: 'smooth' });
						}}
					>
						<i className="fa-solid fa-arrow-up"></i>
					</div>
				)}
			</div>
			<div
				className="btn-down-app"
				onClick={toogleGetApp}
				style={{ right: scrollToTop ? '70px' : '20px' }}
			>
				<span>Get App Mobile</span>
				{getApp && (
					<div className="list-app-container" onClick={getAppTrue}>
						<div
							onClick={() => {
								downloadFile(
									require('./APK Android/app-release.apk'),
									'shopcoinusa',
								);
							}}
							className="list-app-item"
						>
							<Icons.AndroidIcon />
							<div className="list-app-item-text ml8">
								{isLoading ? (
									<>
										<div>
											{valueProgress >= 100
												? 'Done!'
												: 'Downloading, please wait...'}
										</div>
										<ProgressLine value={valueProgress} />
									</>
								) : (
									'Download for Android (.apk)'
								)}
							</div>
						</div>
						<a
							className="list-app-item"
							href="https://play.google.com/store/apps/details?id=com.shopcoin"
							target="_blank"
							alt="Download on Google Play"
							rel="noreferrer"
						>
							<Icons.CHPlayIcon />
							<div className="list-app-item-text ml8">
								Download on Google Play
							</div>
						</a>
						{/* <div className='list-app-item'>
                            <Icons.AppleStoreIcon />
                            <div className='list-app-item-text ml8'>
                                Download on Apple Store
                            </div>
                        </div> */}
					</div>
				)}
			</div>
		</>
	);
}

export default App;
