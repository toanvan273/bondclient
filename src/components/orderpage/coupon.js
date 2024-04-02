import React, { useEffect, useState } from 'react';

function Coupon(props) {
    const [showMore, setShowMore] = useState(false)
    const [label, setLabel] = useState('')
    const [shortLabel, setShortLabel] = useState(null)
    const [fullLabel, setFulllabel] = useState('')

    useEffect(() => {
        if (props.data) {
            const { data, lang } = props
            hanldeSetLabel(data, lang)
        }
    },[props.data])

    const hanldeSetLabel = (data, lang) => {
        if (data && lang) {
            const langLocal = localStorage.getItem('lang') ? localStorage.getItem('lang') : 'vi'
            let text = ''
            if (data.couponType === 'Float') {
                text = langLocal === 'vi' ? data.referenceRateDescription : data.referenceRateDescriptionEn
                setFulllabel(text)
                if (text) {
                    let label = ''
                    const arr = text.split(" ")
                    if (arr.length > 25) {
                        label = arr.slice(0, 25).join(" ")
                        setShortLabel(label)
                        setLabel(label)
                        setShowMore(true)
                    } else {
                        setLabel(text)
                        setShowMore(null)
                    }
                } else {
                    setLabel(null)
                    setShowMore(null)
                }
            } else {
                text = lang['couponFixed'] + data.coupon + '%/' + lang['year']
                setLabel(text)
                setShowMore(null)
            }
        }
    }

    const handleShowMore = () => {
        setLabel(fullLabel)
        setShowMore(false)
    }
    const handleShowLess = () => {
        if (shortLabel) {
            setLabel(shortLabel)
            setShowMore(true)
        }
    }

    const { lang } = props
    return (
        <div>
            <span>{label}</span>
            {showMore !== null && showMore &&
                <span>
                    <span>... </span>
                    <span onClick={handleShowMore}
                        style={{ fontWeight: 100 }}
                        className="anoffer pointer">{lang['seeMore']}</span>
                </span>}
            {showMore !== null && !showMore && shortLabel && <span onClick={handleShowLess}
                style={{ fontWeight: 100 }}
                className="anoffer pointer"> {lang['seeLess']}</span>}
        </div>
    )
}

export default Coupon