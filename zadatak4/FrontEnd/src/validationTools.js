import * as yup from 'yup';
import { DateTime } from 'luxon';


export const bookYupSchema = yup.object().shape({
    id: yup.mixed().nullable(true).default(null),
    title: yup.string().required("Mora se uneti naziv knjige"),
    authors: yup.string().required("Moraju se uneti imena autora"),
    publishDate:yup.date().max(DateTime.now(), "Ne može datum skoriji od danas"),
    genre: yup.string().required("Mora se uneti kategorija"),
    rating: yup.number().required("Mora se uneti ocena"),
    isbn: yup.number().required("Mora se uneti imena isbn"),
    pages: yup.number().required("Mora se uneti broj strana")
});

export const toStandardTime = (time) => {
    return time.toFormat("y-MM-dd");
}

