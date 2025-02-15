import { atom } from "recoil";



export const occurenceAtom = atom({
    key: 'occurenceAtom',
    default: null
})

export const analysisBodyAtom = atom({
    key: 'analysisBodyAtom',
    default: null
})

export const analysisDataAtom = atom({
    key: 'analysisData',
    default: null
})

export const userEmailAtom = atom({
    key: 'userEmail',
    default: ""
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