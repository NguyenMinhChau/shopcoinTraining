import React from 'react';
import className from 'classnames/bind';
import styles from './SelectValue.module.css';
import { FormInput, Icons, Search } from '..';

const cx = className.bind(styles);

export default function SelectValue({
	label,
	nameSearch,
	toggleModal,
	stateModal,
	valueSelect,
	onChangeSearch,
	dataFlag,
	onClick,
	isFormInput,
	valueFormInput,
	onChangeFormInput,
	className,
}) {
	return (
		<div className="detail-item flex-column p0">
			<label className="label mr-auto">{label}</label>
			<div className={`${cx('detail-list')}`}>
				<div className={`${cx('list-container')}`}>
					<div
						onClick={toggleModal}
						className="w100 flex-space-between"
					>
						<div className={`${cx('value')}`}>
							{valueSelect || '---'}
						</div>
						<Icons.SelectOptionArrowIcon />
					</div>
					{stateModal && (
						<div className={`${cx('list')}`}>
							{nameSearch && (
								<div className={`${cx('search')}`}>
									<Search
										name={nameSearch}
										className={`${cx(
											'search-custom',
										)} w100 border0`}
										onChange={onChangeSearch}
									/>
								</div>
							)}
							{dataFlag.map((item, index) => (
								<div
									className={`${cx('item')}`}
									key={index}
									onClick={() => onClick(item.name || item)}
								>
									{item.name ||
										(item?.method_name &&
											item.method_name +
												' - ' +
												item.account_name +
												' - ' +
												item.number)}
								</div>
							))}
						</div>
					)}
				</div>
				{isFormInput && (
					<FormInput
						type="text"
						name="quantityCoin"
						placeholder="Quantity"
						classNameInput={`${cx('fee-input')} mt0`}
						classNameField={`${cx('fee-field')}`}
						value={valueFormInput}
						onChange={onChangeFormInput}
					/>
				)}
			</div>
		</div>
	);
}
