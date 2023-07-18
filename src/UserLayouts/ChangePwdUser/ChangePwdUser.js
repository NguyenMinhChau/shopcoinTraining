import React from 'react';
import { FormInput } from '../../components';

export default function ChangePwdUser({
	nameCr,
	nameNew,
	nameConfirm,
	onChange,
}) {
	return (
		<>
			<FormInput
				label="Current Password"
				placeholder="Enter current password"
				type="password"
				showPwd
				name={nameCr}
				onChange={onChange}
			/>
			<FormInput
				label="New Password"
				placeholder="Enter new password"
				type="password"
				showPwd
				name={nameNew}
				onChange={onChange}
			/>
			<FormInput
				label="Confirm Password"
				placeholder="Confirm password"
				type="password"
				showPwd
				name={nameConfirm}
				onChange={onChange}
			/>
		</>
	);
}
