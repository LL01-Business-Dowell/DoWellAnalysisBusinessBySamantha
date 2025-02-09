import { atom } from "recoil";



export const occurenceAtom = atom({
    key: 'occurenceAtom',
    default: null
})

export const analysisBodyAtom = atom({
    key: 'analysisBodyAtom',
    default: null
})

export const emailPageEligibleAtom = atom({
    key: 'emailPageEligible',
    default: true
})

export const mapPageEligibleAtom = atom({
    key: 'mapPageEligibleAton',
    default: false
})


export const analysisPageEligibleAtom = atom({
    key: 'analysisPageEligible',
    default: false
})