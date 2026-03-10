"use client"

import { InputForm } from "@/components/ui/InputField"
import { useState } from "react"
import { chainsToTSender, erc20Abi, tsenderAbi } from "@/constants"
import { useChainId, useConfig, useConnection } from 'wagmi'
import { readContract } from '@wagmi/core'

export default function AirdropForm() {
    const [tokenAddress, setTokenAddress] = useState("")
    const [recipients, setRecipients] = useState("")
    const [amount, setAmount] = useState("")
    const chainId = useChainId()
    const config = useConfig()
    const connection = useConnection()

    async function getApprovedAmount(tSenderAddress: string | null): Promise<number> {
        if (!tSenderAddress) {
            alert("No address found, please use a supported chain")
            return 0
        }

        const allowance = await readContract(config, {
            abi: erc20Abi,
            address: tokenAddress as `0x${string}`,
            functionName: 'allowance',
            args: [connection.address, tSenderAddress as `0x${string}`]
        })
        return allowance as number
    }

    async function handleSubmit() {
        console.log("tokenAddress", tokenAddress)
        console.log("recipients", recipients)
        console.log("amount", amount)
        console.log("chainId", chainId)

        const tSenderAddress = chainsToTSender[chainId]["tsender"]
        const approvedAmount = await getApprovedAmount(tSenderAddress)

        console.log("tSenderAddress", tSenderAddress)
        console.log("approvedAmount", approvedAmount)
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
                className="
    bg-blue-600 hover:bg-blue-700 
    text-white font-semibold 
    py-2 px-6 
    rounded-lg 
    shadow-md hover:shadow-lg 
    transition-all duration-200 
    active:scale-95 active:shadow-inner
  "
            >
                Send Tokens
            </button>
        </div>
    )
}
