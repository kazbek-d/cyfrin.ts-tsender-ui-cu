"use client"

import { InputForm } from "@/components/ui/InputField"
import {
    useState,
    useMemo,
    useEffect
} from "react"
import {
    chainsToTSender,
    erc20Abi,
    tsenderAbi
} from "@/constants"
import {
    useChainId,
    useConfig,
    useConnection,
    useWriteContract,
    useWaitForTransactionReceipt,
    useReadContracts
} from "wagmi"
import {
    readContract,
    waitForTransactionReceipt
} from "@wagmi/core"
import { calculateTotal, formatTokenAmount } from "@/utils"

export default function AirdropForm() {

    const chainId = useChainId()
    const config = useConfig()
    const connection = useConnection()
    const { data: hash, isPending, error, mutateAsync } = useWriteContract()
    const { isLoading: isConfirming, isSuccess: isConfirmed, isError } = useWaitForTransactionReceipt({
        confirmations: 1,
        hash,
    })

    // #region amounts, recipients and tokenAddress
    // State
    const [tokenAddress, setTokenAddress] = useState("")
    const [recipients, setRecipients] = useState("")
    const [amounts, setAmounts] = useState("")

    // Load State from localStorage
    useEffect(() => {
        const savedTokenAddress = localStorage.getItem('tokenAddress')
        const savedRecipients = localStorage.getItem('recipients')
        const savedAmounts = localStorage.getItem('amounts')

        if (savedTokenAddress) setTokenAddress(savedTokenAddress)
        if (savedRecipients) setRecipients(savedRecipients)
        if (savedAmounts) setAmounts(savedAmounts)
    }, []);

    // Save State to localStorage
    useEffect(() => localStorage.setItem('tokenAddress', tokenAddress), [tokenAddress]);
    useEffect(() => localStorage.setItem('recipients', recipients), [recipients]);
    useEffect(() => localStorage.setItem('amounts', amounts), [amounts]);
    // #endregion

    const { data: tokenData } = useReadContracts({
        contracts: [
            {
                abi: erc20Abi,
                address: tokenAddress as `0x${string}`,
                functionName: "decimals",
            },
            {
                abi: erc20Abi,
                address: tokenAddress as `0x${string}`,
                functionName: "name",
            },
            {
                abi: erc20Abi,
                address: tokenAddress as `0x${string}`,
                functionName: "balanceOf",
                args: [connection.address],
            },
        ]
    })


    const total: number = useMemo(() => calculateTotal(amounts), [amounts])



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
        console.log("amounts", amounts)
        console.log("chainId", chainId)
        console.log("total", total)

        const tSenderAddress = chainsToTSender[chainId]["tsender"]
        const approvedAmount = await getApprovedAmount(tSenderAddress)

        console.log("tSenderAddress", tSenderAddress)
        console.log("approvedAmount", approvedAmount)

        if (approvedAmount < total) {
            const approvalHash = await mutateAsync({
                abi: erc20Abi,
                address: tokenAddress as `0x${string}`,
                functionName: 'approve',
                args: [tSenderAddress as `0x${string}`, BigInt(total)]
            })
            const approvalReceipt = await waitForTransactionReceipt(config, {
                hash: approvalHash
            })
            console.log("Approval confirmed: ", approvalReceipt)

            await mutateAsync({
                abi: tsenderAbi,
                address: tSenderAddress as `0x${string}`,
                functionName: 'airdropERC20',
                args: [
                    tokenAddress,
                    recipients.split(/[,\n]+/).map(addr => addr.trim()).filter(addr => addr !== ''),
                    amounts.split(/[,\n]+/).map(amt => amt.trim()).filter(amt => amt !== ''),
                    BigInt(total),
                ]
            })
        } else {
            await mutateAsync({
                abi: tsenderAbi,
                address: tSenderAddress as `0x${string}`,
                functionName: 'airdropERC20',
                args: [
                    tokenAddress,
                    recipients.split(/[,\n]+/).map(addr => addr.trim()).filter(addr => addr !== ''),
                    amounts.split(/[,\n]+/).map(amt => amt.trim()).filter(amt => amt !== ''),
                    BigInt(total),
                ]
            })
        }
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
                label="Amounts"
                placeholder="100,200,300,..."
                value={amounts}
                onChange={e => setAmounts(e.target.value)}
                large={true}
            />
            <div className="bg-white border border-zinc-300 rounded-lg p-4">
                <h3 className="text-sm font-medium text-zinc-900 mb-3">Transaction Details</h3>
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-zinc-600">Token Name:</span>
                        <span className="font-mono text-zinc-900">
                            {
                                tokenData?.[1]?.result as string
                            }
                        </span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-zinc-600">Amount (wei):</span>
                        <span className="font-mono text-zinc-900">{total}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-zinc-600">Amount (tokens):</span>
                        <span className="font-mono text-zinc-900">
                            {
                                formatTokenAmount(total, tokenData?.[0]?.result as number)
                            }
                        </span>
                    </div>
                </div>
            </div>
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


