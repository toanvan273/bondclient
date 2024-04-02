import * as types from '../constants/action.types';

export const popupDefault = {
    // status: true,
    status: false,
    // type: 'transfer-limitation',
    type: null,
    data: null,
    funCallBack: null,
}
  
export default function (state = popupDefault, action) {
    switch (action.type) {
        case types.OPEN_POPUP:
            return { status:true, ...action.payload}
        case types.CLOSE_POPUP:
            return {...popupDefault}
        default:
            return state
    }
}