const AuthApiErrors = {
	vi: {
		'AUTH-01': 'Bạn cần đăng nhập lại để sử dụng chức năng này.',
		'AUTH-02':
			'Tên đăng nhập hoặc mật khẩu bạn vừa nhập chưa đúng, xin vui lòng thử lại.',
		'AUTH-03': 'Token đăng nhập không hợp lệ. Xin đóng cửa sổ và thử lại.',
		'AUTH-04':
			'Phiên đăng nhập của bạn đã kết thúc, xin vui lòng đăng nhập lại.',
		'AUTH-05': 'Bạn cần xác nhận thẻ VTOS để sử dụng chức năng này.',
		'AUTH-06':
			'Mã VTOS bạn vừa điền chưa đúng, xin vui lòng thử lại. Lưu ý tránh sử dụng bộ gõ tiếng Việt.',
		'AUTH-07':
			'Thẻ VTOS của bạn đã bị khóa. Vui lòng gọi cho chúng tôi theo số 1900-54-54-09 để mở lại thẻ.',
		'AUTH-08':
			'Thẻ VTOS của bạn chưa được kích hoạt. Vui lòng gọi cho chúng tôi theo số 1900-54-54-09 để được hỗ trợ.',
		'AUTH-09':
			'Thẻ VTOS của bạn đã hết hạn. Vui lòng gọi cho chúng tôi theo số 1900-54-54-09 để được hỗ trợ.',
		'AUTH-10':
			'Có lỗi xảy ra với thẻ VTOS của bạn. Vui lòng gọi cho chúng tôi theo số 1900-54-54-09 để được hỗ trợ.',
		'AUTH-11':
			'Có lỗi xảy ra với quá trình xác nhận VTOS. Vui lòng gọi cho chúng tôi theo số 1900-54-54-09 để được hỗ trợ.',
		'AUTH-99':
			'Có lỗi xảy ra với quá trình xác nhận VTOS. Vui lòng gọi cho chúng tôi theo số 1900-54-54-09 để được hỗ trợ.',

		'CLIENT-01':
			'Có lỗi xảy ra với phiên đăng nhập của bạn, xin vui lòng đăng nhập lại.',
		'CLIENT-02':
			'Có lỗi xảy ra với trình duyệt của bạn. Xin vui lòng refresh lại trang và thử lại.',
		'CLIENT-03':
			'Có lỗi xảy ra với trình duyệt của bạn. Xin vui lòng refresh lại trang và thử lại.',

		'OTP-001': 'Token OTP không hợp lệ',
		'OTP-002': 'Request action từ client không đúng',
		'OTP-003': 'Không nhận được customerId của khách hàng',
		'OTP-004': 'Quý khách vui lòng nhập mã OTP.',
		'OTP-005': 'Thiếu token',
		'OTP-006': 'thiếu loại nhận OTP qua APP hay SMS',
		'OTP-007': 'Lỗi tạo link QRCode',
		'OTP-008': 'Mã OTP chưa chính xác. Quý khách vui lòng nhập lại.',
		'OTP-009': 'Kiểu nhận mã otp không được hỗ trợ',
		'OTP-010': 'Truyền sai 2FA (chỉ hỗ trợ VTOS hoặc OTP)',
		'OTP-011':
			'Lỗi: Tài khoản của Quý khách đã đăng ký sử dụng OTP, không thể đăng ký lại. Vui lòng liên hệ Nhân viên QLTK hoặc tổng đài 1900545409 để biết thêm chi tiết.',
		'OTP-012': 'Thông tin authenticator của khách hàng không tồn tại,',
		'OTP-013':
			'Khách hàng chưa đăng ký sử dụng OTP hoặc token OTP đã được thu hồi.',

		'SMS-2': 'ServiceId must not empty',
		'SMS-3': 'Invalid ServiceId',
		'SMS-4': 'CustomerId must not empty',
		'SMS-5': 'Info must not empty',
		'SMS-6':
			'Quý khách chưa đăng ký số điện thoại. Vui lòng liên hệ tổng đài 1900 5454 09 để được hỗ trợ.',
		'ERROR-1': 'Đặt lệnh không thành công.'
	},

	en: {
		'AUTH-01': 'You need to log in again to use this feature.',
		'AUTH-02': 'Incorrect username or password, please try again.',
		'AUTH-03':
			'Invalid login token. Please close this window and try again.',
		'AUTH-04': 'Your session is expired, please log in again.',
		'AUTH-05':
			'You have to verify your VTOS card in order to use this feature.',
		'AUTH-06': "VTOS code you've entered is incorrect. Please try again.",
		'AUTH-07':
			'Your VTOS card is locked. Please call us at 1900-54-54-09 to unlock.',
		'AUTH-08':
			'Your VTOS card is not activated. Please call us at 1900-54-54-09 for assistance.',
		'AUTH-09':
			'Your VTOS card is expired. Please call us at 1900-54-54-09 for assistance.',
		'AUTH-10':
			'Something happened with your VTOS card. Please call us at 1900-54-54-09 for assistance.',
		'AUTH-11':
			'An error has occured during VTOS verification, please try again. If the problem persists, please call us at 1900-54-54-09 for assistance.',
		'AUTH-99':
			'An error has occured during VTOS verification, please try again.',

		'CLIENT-01':
			'An error has occured with your login session, please try to log in again.',
		'CLIENT-02':
			'An error has occured with your browser. Please refresh the page and try again.',
		'CLIENT-03':
			'An error has occured with your browser. Please refresh the page and try again.',

		'OTP-001':
			"The OTP verification code you've entered is incorrect or expired. Please try again.",
		'OTP-002':
			'An error has occured with our system, please try again. If this problem persists, please call us at 1900-54-54-09 for assistance.',
		'OTP-003':
			'An error has occured with our system, please try again. If this problem persists, please call us at 1900-54-54-09 for assistance.',
		'OTP-004':
			"The OTP verification code you've entered is incorrect, please try again.",
		'OTP-005':
			'An error has occured with our system, please try again. If this problem persists, please call us at 1900-54-54-09 for assistance.',
		'OTP-006':
			'An error has occured with our system, please try again. If this problem persists, please call us at 1900-54-54-09 for assistance.',
		'OTP-007':
			'An error has occured with our system, please try again. If this problem persists, please call us at 1900-54-54-09 for assistance.',
		'OTP-008':
			"The OTP verification code you've entered is incorrect, please try again.",
		'OTP-009':
			'An error has occured with our system, please try again. If this problem persists, please call us at 1900-54-54-09 for assistance.',
		'OTP-010':
			'An error has occured with our system, please try again. If this problem persists, please call us at 1900-54-54-09 for assistance.',
		'OTP-011':
			'An error has occured with our system, please try again. If this problem persists, please call us at 1900-54-54-09 for assistance.',
		'OTP-012':
			'An error has occured with our system, please try again. If this problem persists, please call us at 1900-54-54-09 for assistance.',
		'OTP-013':
			'Your account has not been registered with OTP verification. Please call us at 1900-54-54-09 if you want to use this feature.',
		'OTP-014':
			'An error has occured with our system, please try again. If this problem persists, please call us at 1900-54-54-09 for assistance.',
		'OTP-015':
			'An error has occured with our system, please try again. If this problem persists, please call us at 1900-54-54-09 for assistance.',
		'OTP-016':
			'An error has occured with our system, please try again. If this problem persists, please call us at 1900-54-54-09 for assistance.',

		'SMS-2': 'ServiceId must not empty',
		'SMS-3': 'Invalid ServiceId',
		'SMS-4': 'CustomerId must not empty',
		'SMS-5': 'Info must not empty',
		'SMS-6':
			'Quý khách chưa đăng ký số điện thoại. Vui lòng liên hệ tổng đài 1900 5454 09 để được hỗ trợ.',
			'ERROR-1': 'Create deal failed.'
	}
};

export default AuthApiErrors;
