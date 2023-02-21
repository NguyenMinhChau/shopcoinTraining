import React from 'react';
import className from 'classnames/bind';
import styles from './UploadDocumentUser.module.css';
import { Icons, Image } from '../../components';

const cx = className.bind(styles);
const URL_SERVER =
    process.env.REACT_APP_TYPE === 'development'
        ? process.env.REACT_APP_URL_SERVER
        : process.env.REACT_APP_URL_SERVER_PRODUCTION;
const RenderImageDocument = ({
    nameFile,
    idFile,
    urlImage,
    urlImagePending,
    onChange,
}) => {
    return (
        <label className={`${cx('image-item')}`} id={idFile}>
            {!urlImage ? (
                <>
                    <Icons.UploadIcon className={`${cx('icon-upload')}`} />
                </>
            ) : (
                <Image
                    src={
                        !urlImagePending
                            ? `${URL_SERVER}/${urlImage?.replace(
                                  'uploads/',
                                  ''
                              )}`
                            : urlImagePending
                    }
                    alt=''
                    className={`${cx('image-view')}`}
                />
            )}
            <input
                type='file'
                id={idFile}
                className={`${cx('input-file')}`}
                name={nameFile}
                onChange={onChange}
            />
        </label>
    );
};

export default function UploadDocumentUser({
    user,
    uploadCCCDFont,
    urlUploadCCCDFont,
    uploadCCCDBeside,
    urlUploadCCCDBeside,
    uploadLicenseFont,
    urlUploadLicenseFont,
    uploadLicenseBeside,
    urlUploadLicenseBeside,
    onChangeUploadCCCDFont,
    onChangeUploadCCCDBeside,
    onChangeUploadLicenseFont,
    onChangeUploadLicenseBeside,
}) {
    return (
        <>
            <div className={`${cx('container-document')}`}>
                <div className={`${cx('document-title')}`}>
                    1. Citizen Identification
                </div>
                <div className={`${cx('doucment-image-container')}`}>
                    <RenderImageDocument
                        nameFile={uploadCCCDFont}
                        idFile={uploadCCCDFont}
                        urlImage={user?.uploadCCCDFont}
                        onChange={onChangeUploadCCCDFont}
                        urlImagePending={urlUploadCCCDFont}
                    />
                    <RenderImageDocument
                        nameFile={uploadCCCDBeside}
                        idFile={uploadCCCDBeside}
                        urlImage={user?.uploadCCCDBeside}
                        onChange={onChangeUploadCCCDBeside}
                        urlImagePending={urlUploadCCCDBeside}
                    />
                </div>
            </div>
            <div className={`${cx('container-document')}`}>
                <div className={`${cx('document-title')}`}>2. License</div>
                <div className={`${cx('doucment-image-container')}`}>
                    <RenderImageDocument
                        nameFile={uploadLicenseFont}
                        idFile={uploadLicenseFont}
                        urlImage={user?.uploadLicenseFont}
                        onChange={onChangeUploadLicenseFont}
                        urlImagePending={urlUploadLicenseFont}
                    />
                    <RenderImageDocument
                        nameFile={uploadLicenseBeside}
                        idFile={uploadLicenseBeside}
                        urlImage={user?.uploadLicenseBeside}
                        onChange={onChangeUploadLicenseBeside}
                        urlImagePending={urlUploadLicenseBeside}
                    />
                </div>
            </div>
        </>
    );
}
