"use client"

import { useEffect, useRef } from "react"
import { showToast } from "@/lib/toast"

export function WardPageToast() {
    const hasShown = useRef(false)

    useEffect(() => {
        if (hasShown.current) return
        hasShown.current = true

        showToast(
            "warning",
            "Data Verification Notice",
            "Metrics might be prone to human error. Please verify from the affidavit link provided."
        )
    }, [])

    return null
}
