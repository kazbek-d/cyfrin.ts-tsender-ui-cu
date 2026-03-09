"use client"

import { InputForm } from "./ui/InputField"
import { useState } from "react"

export default function AirdropForm() {
    const [tokenAddress, setTokenAddress] = useState("")
    const [recipients, setRecipients] = useState("")
    const [amount, setAmount] = useState("")

    async function handleSubmit() {
        console.log("tokenAddress", tokenAddress)
        console.log("recipients", recipients)
        console.log("amount", amount)
    }

    return (
        <div>
            <InputForm
                label="Token Address"
                placeholder="0x"
                value={tokenAddress}
                onChange={e => setTokenAddress(e.target.value)}
            />
            <InputForm
                label="Recipients"
                placeholder="0x123,0x1234,0x12345,..."
                value={recipients}
                onChange={e => setRecipients(e.target.value)}
                large={true}
            />
            <InputForm
                label="Amount"
                placeholder="100,200,300,..."
                value={amount}
                onChange={e => setAmount(e.target.value)}
                large={true}
            />
            <button
                onClick={handleSubmit}
            >
                Send Tokens
            </button>
        </div>
    )
}
