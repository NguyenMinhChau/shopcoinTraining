/* eslint-disable no-unused-vars */
import React from 'react';
import className from 'classnames/bind';
import styles from './SnackbarCp.module.css';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';

const cx = className.bind(styles);
const Alert = React.forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant='filled' {...props} />;
});

export default function SnackbarCp({
    openSnackbar,
    handleCloseSnackbar,
    typeSnackbar,
    messageSnackbar,
    autoHideDuration = 6000,
}) {
    return (
        <>
            <Snackbar
                open={openSnackbar}
                autoHideDuration={autoHideDuration}
                onClose={handleCloseSnackbar}
            >
                <Alert
                    onClose={handleCloseSnackbar}
                    severity={typeSnackbar}
                    sx={{ width: '100%' }}
                >
                    {messageSnackbar}
                </Alert>
            </Snackbar>
        </>
    );
}
