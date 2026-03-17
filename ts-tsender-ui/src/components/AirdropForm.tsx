"use client"

import { InputForm } from "@/components/ui/InputField"
import {
    useState,
    useMemo,
    useEffect
} from "react"
import { CgSpinner } from "react-icons/cg"
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
    const [hasEnoughTokens, setHasEnoughTokens] = useState(true)
    useEffect(() => {
        if (tokenAddress
            && total > 0
            && tokenData?.[2].result
            && tokenData?.[2].result as number != undefined) {
            const userBalance = tokenData?.[2].result as number
            setHasEnoughTokens(userBalance > total)
        } else {
            setHasEnoughTokens(true)
        }
    }, [tokenAddress, total, tokenData])

    const isDisabled: boolean =
        isPending ||
        !hasEnoughTokens ||
        tokenAddress.trim() === "" ||
        recipients.trim() === "" ||
        total <= 0;

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

    function getButtonContent() {
        if (isPending)
            return (
                <div className="flex items-center justify-center gap-2 w-full">
                    <CgSpinner className="animate-spin" size={20} />
                    <span>Confirming in wallet...</span>
                </div>
            )
        if (isConfirming)
            return (
                <div className="flex items-center justify-center gap-2 w-full">
                    <CgSpinner className="animate-spin" size={20} />
                    <span>Waiting for transaction to be included...</span>
                </div>
            )
        if (error || isError) {
            console.log(error)
            return (
                <div className="flex items-center justify-center gap-2 w-full">
                    <span>Error, see console.</span>
                </div>
            )
        }
        if (isConfirmed) {
            return "Transaction confirmed."
        }
        return "Send Tokens"
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
                                tokenData?.[0]?.result
                                    ? formatTokenAmount(total, tokenData?.[0]?.result as number)
                                    : ''
                            }
                        </span>
                    </div>
                </div>
            </div>

            <button
                onClick={handleSubmit}
                className={`cursor-pointer flex items-center justify-center w-full py-3 rounded-[9px] 
                    text-white transition-colors font-semibold relative border bg-blue-500 
                    hover:bg-blue-600 border-blue-500"
                        ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
                disabled={isDisabled}
            >
                {/* Gradient */}
                <div className="absolute w-full inset-0 bg-gradient-to-b from-white/25 via-80% 
                    to-transparent mix-blend-overlay z-10 rounded-lg pointer-events-none" />
                {/* Inner shadow */}
                <div className="absolute w-full inset-0 mix-blend-overlay z-10 inner-shadow 
                    rounded-lg pointer-events-none" />
                {/* White inner border */}
                <div className="absolute w-full inset-0 mix-blend-overlay z-10 border-[1.5px] 
                    border-white/20 rounded-lg pointer-events-none" />
                {isPending || error || isConfirming
                    ? getButtonContent()
                    : !hasEnoughTokens && tokenAddress
                        ? "Insufficient token balance"
                        : "Send Tokens"}
            </button>

        </div>
    )
}


