import React from 'react';
import PropTypes from 'prop-types';
import className from 'classnames/bind';
import { useAppContext, searchUtils, refreshPage } from '../../utils';
import { Search, Button, TableData, Icons, SnackbarCp } from '../../components';
import { actions } from '../../app/';
import styles from './General.module.css';

const cx = className.bind(styles);

function General({
	valueSearch,
	nameSearch,
	noSearch,
	onCreate,
	onUpdateRate,
	linkCreate,
	textBtnNew,
	isRefreshPage,
	textBtnUpdateAllFields,
	dataFlag,
	totalData,
	dataHeaders,
	children,
	className,
	classNameButton,
	classNameButtonUpdateAllFields,
	noActions,
	openSnackbar,
	handleCloseSnackbar,
	messageSnackbar,
	typeSnackbar,
	PaginationCus,
	startPagiCus,
	endPagiCus,
	dataPagiCus,
}) {
	const { state, dispatch } = useAppContext();
	const changeSearch = (e) => {
		return searchUtils.logicSearch(e, dispatch, state, actions);
	};
	const classed = cx('general-container', className);
	const classedButton = cx('general-button', classNameButton);
	const classedButtonAllFileds = cx(
		'general-button',
		classNameButtonUpdateAllFields,
	);
	return (
		<>
			<div className={classed}>
				<SnackbarCp
					openSnackbar={openSnackbar}
					handleCloseSnackbar={handleCloseSnackbar}
					messageSnackbar={messageSnackbar}
					typeSnackbar={typeSnackbar}
				/>
				<div className={`${cx('general-top')}`}>
					{!noSearch && (
						<Search
							name={nameSearch}
							value={valueSearch}
							onChange={changeSearch}
						/>
					)}
					<div className="flex-center">
						{textBtnUpdateAllFields && (
							<Button
								className={classedButtonAllFileds}
								onClick={onUpdateRate}
							>
								<span
									className={`${cx('general-button-icon')}`}
								>
									<i className="fa-regular fa-pen-to-square"></i>
								</span>
								<span
									className={`${cx('general-button-text')}`}
								>
									{textBtnUpdateAllFields}
								</span>
							</Button>
						)}
						{textBtnNew && (
							<Button
								className={`${classedButton} mt8-mobile`}
								onClick={onCreate}
								to={linkCreate}
							>
								<span
									className={`${cx('general-button-icon')}`}
								>
									<i className="fa-solid fa-plus"></i>
								</span>
								<span
									className={`${cx('general-button-text')}`}
								>
									{textBtnNew}
								</span>
							</Button>
						)}
						<Button
							className="confirmbgc mt8-mobile"
							onClick={refreshPage.refreshPage}
						>
							<div className="flex-center">
								<Icons.RefreshIcon className="fz12" />
								<span
									className={`${cx('general-button-text')}`}
								>
									Refresh Page
								</span>
							</div>
						</Button>
					</div>
				</div>
				<div className={`${cx('general-table-container')}`}>
					<TableData
						data={PaginationCus ? dataPagiCus : dataFlag}
						PaginationCus={PaginationCus}
						startPagiCus={startPagiCus}
						endPagiCus={endPagiCus}
						dataPagiCus={dataPagiCus}
						totalData={totalData}
						headers={dataHeaders}
						search={valueSearch ? valueSearch : ''}
						noActions={noActions}
					>
						{children}
					</TableData>
				</div>
			</div>
		</>
	);
}

General.propTypes = {
	valueSearch: PropTypes.string,
	nameSearch: PropTypes.string,
	onCreate: PropTypes.func,
	linkCreate: PropTypes.string,
	textBtnNew: PropTypes.string,
	dataFlag: PropTypes.array,
	totalData: PropTypes.number,
	dataHeaders: PropTypes.object,
	titleDelModal: PropTypes.string,
	textDelModal: PropTypes.string,
	// typeDataDel: PropTypes.node,
	nameTypeDataDel: PropTypes.string,
	children: PropTypes.node,
	className: PropTypes.string,
};

export default General;
