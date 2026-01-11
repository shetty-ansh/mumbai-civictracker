"use client"

import { useEffect, useRef } from "react"
import { showToast } from "@/lib/toast"

export function WardPageToast() {
    const hasShown = useRef(false)

    useEffect(() => {
        if (hasShown.current) return
        hasShown.current = true

        showToast(
            "info",
            "Data Transparency",
            "We encourage you to check the attached affidavit for official verification."
        )
    }, [])

    return null
}
