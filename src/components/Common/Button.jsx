function Button({ styles, title, event}) {
    return <button
    className={styles}
    onClick={event}
    >{title}</button>
}

export default Button
