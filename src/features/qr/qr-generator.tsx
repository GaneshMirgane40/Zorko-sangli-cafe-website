'use client'

import { Download, ExternalLink, Printer, QrCode as QrIcon, Sparkles } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import QRCode from 'qrcode'
import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'

interface QrGeneratorProps {
  siteUrl: string
}

export function QrGenerator({ siteUrl }: QrGeneratorProps) {
  const [table, setTable] = useState<number | 'general'>('general')
  const [customTable, setCustomTable] = useState<string>('')
  const [svgData, setSvgData] = useState<string>('')
  const [bulkMode, setBulkMode] = useState(false)
  const [bulkCount, setBulkCount] = useState(10)
  const [bulkQrs, setBulkQrs] = useState<{ tableNum: number; svg: string }[]>([])
  const printAreaRef = useRef<HTMLDivElement>(null)

  const activeTableNum =
    table === 'general' ? null : customTable ? customTable : String(table)

  const targetUrl = activeTableNum
    ? `${siteUrl}/menu?table=${encodeURIComponent(activeTableNum)}`
    : `${siteUrl}/menu`

  // Generate single QR SVG
  useEffect(() => {
    QRCode.toString(
      targetUrl,
      {
        type: 'svg',
        margin: 2,
        color: {
          dark: '#1c1b1b',
          light: '#ffffff',
        },
      },
      (err, string) => {
        if (!err && string) {
          setSvgData(string)
        }
      },
    )
  }, [targetUrl])

  // Generate bulk QRs for Table 1..N
  useEffect(() => {
    if (!bulkMode) return
    let isCancelled = false
    async function genAll() {
      const list: { tableNum: number; svg: string }[] = []
      for (let i = 1; i <= bulkCount; i++) {
        const u = `${siteUrl}/menu?table=${i}`
        const s = await QRCode.toString(u, {
          type: 'svg',
          margin: 2,
          color: { dark: '#1c1b1b', light: '#ffffff' },
        })
        list.push({ tableNum: i, svg: s })
      }
      if (!isCancelled) setBulkQrs(list)
    }
    genAll()
    return () => {
      isCancelled = true
    }
  }, [bulkMode, bulkCount, siteUrl])

  // Download SVG
  const handleDownloadSvg = () => {
    if (!svgData) return
    const blob = new Blob([svgData], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `zorko-qr-${activeTableNum ? `table-${activeTableNum}` : 'menu'}.svg`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Download PNG via canvas
  const handleDownloadPng = async () => {
    try {
      const pngUrl = await QRCode.toDataURL(targetUrl, {
        width: 1024,
        margin: 2,
        color: { dark: '#1c1b1b', light: '#ffffff' },
      })
      const a = document.createElement('a')
      a.href = pngUrl
      a.download = `zorko-qr-${activeTableNum ? `table-${activeTableNum}` : 'menu'}.png`
      a.click()
    } catch (e) {
      console.error('Failed to generate PNG', e)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="flex flex-col gap-space-xl">
      {/* ── Controls (Hidden when printing) ── */}
      <div className="print:hidden flex flex-col gap-space-lg rounded-3xl border border-surface-container-high bg-surface-container-lowest p-space-lg shadow-sm md:p-space-xl">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="font-heading text-headline-md text-on-surface">
              Table QR Code Configuration
            </h2>
            <p className="text-body-md text-on-surface-variant">
              Select a table number to create custom table standee cards, or generate for all tables.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setBulkMode(!bulkMode)}
              className={`rounded-full px-4 py-2 text-label-md font-bold transition-all ${
                bulkMode
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Sparkles className="size-4" />
                {bulkMode ? 'Bulk Mode: ON (Print All)' : 'Bulk Print Tables'}
              </span>
            </button>
          </div>
        </div>

        {!bulkMode ? (
          <div className="flex flex-col gap-space-md">
            <div>
              <label className="mb-2 block text-label-md font-bold text-on-surface">
                Quick Select Table:
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setTable('general')
                    setCustomTable('')
                  }}
                  className={`rounded-xl px-4 py-2 text-label-md font-bold transition-colors ${
                    table === 'general' && !customTable
                      ? 'bg-primary text-white shadow-sm'
                      : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
                  }`}
                >
                  General Menu
                </button>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => {
                      setTable(num)
                      setCustomTable('')
                    }}
                    className={`rounded-xl px-4 py-2 text-label-md font-bold transition-colors ${
                      table === num && !customTable
                        ? 'bg-primary text-white shadow-sm'
                        : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
                    }`}
                  >
                    Table {num}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <label htmlFor="custom-table" className="text-body-md font-medium text-on-surface">
                Or enter custom table name/number:
              </label>
              <input
                id="custom-table"
                type="text"
                value={customTable}
                onChange={(e) => setCustomTable(e.target.value)}
                placeholder="e.g. Table 15 or Patio 1"
                className="h-10 rounded-xl border border-surface-container-high bg-surface px-3 text-body-md text-on-surface focus:border-primary focus:outline-none"
              />
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-4 rounded-2xl bg-surface-container-low p-space-md">
            <span className="text-body-md font-medium text-on-surface">
              Generate QR standees for tables:
            </span>
            <select
              value={bulkCount}
              onChange={(e) => setBulkCount(Number(e.target.value))}
              className="h-10 rounded-xl border border-surface-container-high bg-white px-3 text-body-md font-bold"
            >
              <option value={5}>Tables 1 to 5</option>
              <option value={10}>Tables 1 to 10</option>
              <option value={15}>Tables 1 to 15</option>
              <option value={20}>Tables 1 to 20</option>
            </select>
            <span className="text-body-sm text-on-surface-variant">
              Click &quot;Print Standee Cards&quot; to print all {bulkCount} table cards at once!
            </span>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-surface-container">
          <Button onClick={handlePrint} variant="primary" className="gap-2 shadow-sm">
            <Printer className="size-4" />
            Print {bulkMode ? `All ${bulkCount} Tables` : 'Table Standee'}
          </Button>

          {!bulkMode && (
            <>
              <Button onClick={handleDownloadPng} variant="secondary" className="gap-2">
                <Download className="size-4" />
                Download PNG
              </Button>
              <Button onClick={handleDownloadSvg} variant="secondary" className="gap-2">
                <Download className="size-4" />
                Download SVG
              </Button>
            </>
          )}

          <Link
            href={targetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-label-md font-semibold text-primary hover:bg-primary/5 transition-colors ml-auto"
          >
            <span>Test Menu Link</span>
            <ExternalLink className="size-4" />
          </Link>
        </div>
      </div>

      {/* ── Single Standee Card Preview ── */}
      {!bulkMode ? (
        <div className="flex justify-center py-space-md">
          <div
            ref={printAreaRef}
            className="w-full max-w-sm overflow-hidden rounded-3xl border-2 border-primary/20 bg-white p-space-xl shadow-xl text-center print:border-2 print:border-black print:shadow-none print:m-auto print:max-w-[340px]"
          >
            {/* Logo */}
            <div className="flex justify-center mb-space-md">
              <Image
                src="/logo.webp"
                alt="ZORKO Brand of Food Lovers"
                width={140}
                height={55}
                className="h-12 w-auto object-contain"
                priority
              />
            </div>

            {/* Table Badge */}
            <div className="mb-space-md">
              <span className="inline-block rounded-full bg-primary px-4 py-1.5 font-heading text-label-md font-bold text-white uppercase tracking-wider">
                {activeTableNum ? `Table ${activeTableNum}` : 'Digital Menu'}
              </span>
            </div>

            <p className="text-body-sm font-medium text-on-surface-variant mb-space-md">
              Scan with your phone camera to view our live digital menu &amp; specials.
            </p>

            {/* QR Code Container */}
            <div className="mx-auto my-2 size-56 overflow-hidden rounded-2xl border border-surface-container-high p-3 bg-white shadow-inner flex items-center justify-center">
              {svgData ? (
                <div
                  className="size-full [&>svg]:size-full"
                  dangerouslySetInnerHTML={{ __html: svgData }}
                />
              ) : (
                <div className="flex items-center justify-center size-full text-on-surface-variant">
                  <QrIcon className="size-16 animate-pulse opacity-40" />
                </div>
              )}
            </div>

            {/* Footer / Info */}
            <div className="mt-space-md pt-space-sm border-t border-surface-container text-body-xs text-on-surface-variant">
              <p className="font-bold text-on-surface">ZORKO Sangli · 100% Pure Veg</p>
              <p className="truncate text-[11px] text-outline mt-0.5">{targetUrl}</p>
            </div>
          </div>
        </div>
      ) : (
        /* ── Bulk Standee Cards for Printing ── */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 print:grid-cols-2 print:gap-4">
          {bulkQrs.map(({ tableNum, svg }) => (
            <div
              key={tableNum}
              className="overflow-hidden rounded-3xl border-2 border-primary/20 bg-white p-space-lg shadow-md text-center print:border-2 print:border-black print:break-inside-avoid print:shadow-none"
            >
              <div className="flex justify-center mb-3">
                <Image
                  src="/logo.webp"
                  alt="ZORKO"
                  width={110}
                  height={45}
                  className="h-9 w-auto object-contain"
                />
              </div>

              <div className="mb-2">
                <span className="inline-block rounded-full bg-primary px-3 py-1 font-heading text-label-sm font-bold text-white uppercase tracking-wider">
                  Table {tableNum}
                </span>
              </div>

              <p className="text-[12px] text-on-surface-variant mb-2">Scan for live digital menu</p>

              <div className="mx-auto size-44 overflow-hidden rounded-xl border border-surface-container-high p-2 bg-white flex items-center justify-center">
                <div
                  className="size-full [&>svg]:size-full"
                  dangerouslySetInnerHTML={{ __html: svg }}
                />
              </div>

              <div className="mt-3 pt-2 border-t border-surface-container text-[11px] text-on-surface-variant">
                <p className="font-bold text-on-surface">ZORKO Sangli · 100% Veg</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

