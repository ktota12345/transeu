export const dateFormat = (date, withTime = false) => {

    return (date === null) ? '-' : new Date(date).toISOString().slice(0, withTime ? 16:10).replace("T"," ");
}
