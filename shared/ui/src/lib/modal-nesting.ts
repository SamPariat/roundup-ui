import { createContext } from 'react'

/**
 * Whether a Modal sits inside another Modal's body, like a date field's picker in the New event form.
 * The outer one already dims and blurs the screen, so the inner one leaves its backdrop clear.
 */
export const ModalNestingContext = createContext<boolean>(false)
