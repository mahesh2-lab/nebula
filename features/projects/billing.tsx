'use client';

import * as React from 'react';
import { Project } from '../../store/store';
import { CreditCard, Award, ArrowUpRight, CheckCircle2, ChevronRight, FileText } from 'lucide-react';
import { toast } from 'sonner';

export function Billing({ project }: { project?: Project }) {
  // Usage calculations
  const bandwidthUsed = project?.billing.bandwidthUsed ?? 42.8;
  const bandwidthLimit = project?.billing.bandwidthLimit ?? 100.0;
  const requestsUsed = project?.billing.requestsUsed ?? 12.4;
  const requestsLimit = project?.billing.requestsLimit ?? 50.0;
  const buildMinutesUsed = project?.billing.buildMinutesUsed ?? 210;
  const buildMinutesLimit = project?.billing.buildMinutesLimit ?? 1000;

  const invoices = [
    { id: 'INV-830219', date: '2026-06-01', amount: '$24.00', status: 'Paid' },
    { id: 'INV-482092', date: '2026-05-01', amount: '$20.00', status: 'Paid' },
    { id: 'INV-190382', date: '2026-04-01', amount: '$20.00', status: 'Paid' }
  ];

  return (
    <div className="p-6 space-y-6">
      
      {/* Active tier settings */}
      <div className="border border-[#1f1f1f] bg-[#111113] p-4 rounded-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-[#FAFAFA] font-mono font-semibold">
            <Award className="h-4 w-4 text-[#F59E0B]" />
            <span>ACTIVE WORKSPACE PLAN</span>
          </div>
          <h3 className="text-sm font-semibold text-white font-mono">Enterprise Professional Tier</h3>
          <p className="text-xs text-[#71717A]">Linked credit card: Visa ending in 4242. Next renew billing date: August 1, 2026.</p>
        </div>

        <button 
          onClick={() => toast.success('Workspace tier upgrade options loaded.')}
          className="flex h-8 items-center justify-center gap-1 bg-white text-[#09090B] hover:bg-neutral-200 active:bg-neutral-300 text-xs font-semibold rounded-sm transition-colors font-mono"
        >
          <span>Upgrade Tier</span>
          <ArrowUpRight className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Usage statistics cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Bandwidth bar */}
        <div className="border border-[#1f1f1f] bg-[#111113] p-4 rounded-md space-y-3">
          <div className="flex justify-between items-center text-xs text-[#71717A] font-mono">
            <span>EDGE BANDWIDTH</span>
            <span>{((bandwidthUsed / bandwidthLimit) * 100).toFixed(1)}%</span>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between items-baseline font-mono">
              <span className="text-lg font-semibold text-[#FAFAFA]">{bandwidthUsed} GB</span>
              <span className="text-[10px] text-[#71717A]">/ {bandwidthLimit} GB</span>
            </div>
            <div className="w-full bg-[#09090B] h-1.5 rounded-full border border-[#1f1f1f] overflow-hidden">
              <div className="bg-white h-full" style={{ width: `${(bandwidthUsed / bandwidthLimit) * 100}%` }} />
            </div>
          </div>
        </div>

        {/* Requests bar */}
        <div className="border border-[#1f1f1f] bg-[#111113] p-4 rounded-md space-y-3">
          <div className="flex justify-between items-center text-xs text-[#71717A] font-mono">
            <span>HTTPS REQUESTS</span>
            <span>{((requestsUsed / requestsLimit) * 100).toFixed(1)}%</span>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between items-baseline font-mono">
              <span className="text-lg font-semibold text-[#FAFAFA]">{requestsUsed} M</span>
              <span className="text-[10px] text-[#71717A]">/ {requestsLimit} M</span>
            </div>
            <div className="w-full bg-[#09090B] h-1.5 rounded-full border border-[#1f1f1f] overflow-hidden">
              <div className="bg-white h-full" style={{ width: `${(requestsUsed / requestsLimit) * 100}%` }} />
            </div>
          </div>
        </div>

        {/* Build execution minutes */}
        <div className="border border-[#1f1f1f] bg-[#111113] p-4 rounded-md space-y-3">
          <div className="flex justify-between items-center text-xs text-[#71717A] font-mono">
            <span>BUILD CONTEXT MINUTES</span>
            <span>{((buildMinutesUsed / buildMinutesLimit) * 100).toFixed(1)}%</span>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between items-baseline font-mono">
              <span className="text-lg font-semibold text-[#FAFAFA]">{buildMinutesUsed} Min</span>
              <span className="text-[10px] text-[#71717A]">/ {buildMinutesLimit} Min</span>
            </div>
            <div className="w-full bg-[#09090B] h-1.5 rounded-full border border-[#1f1f1f] overflow-hidden">
              <div className="bg-white h-full" style={{ width: `${(buildMinutesUsed / buildMinutesLimit) * 100}%` }} />
            </div>
          </div>
        </div>

      </div>

      {/* Invoices List Table */}
      <div className="border border-[#1f1f1f] bg-[#111113] rounded-md overflow-hidden font-mono text-xs">
        <div className="px-4 py-3 bg-[#18181B] border-b border-[#1f1f1f]">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[#A1A1AA] font-bold">Past Invoices & Receipts</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#1f1f1f] bg-[#09090B]/60 text-[10px] text-[#71717A] uppercase">
                <th className="p-3">Invoice ID</th>
                <th className="p-3">Billing Date</th>
                <th className="p-3">Total Amount</th>
                <th className="p-3">Payment Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1f1f1f]">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-[#18181B] transition-colors">
                  <td className="p-3 font-semibold text-white">{inv.id}</td>
                  <td className="p-3 text-zinc-400">{inv.date}</td>
                  <td className="p-3 text-zinc-300">{inv.amount}</td>
                  <td className="p-3">
                    <span className="inline-flex items-center gap-1 text-[#22C55E] bg-[#22C55E]/10 px-2 py-0.5 rounded text-[10px] font-bold">
                      <CheckCircle2 className="h-3 w-3" />
                      {inv.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => toast.info(`Downloading PDF receipt for ${inv.id}`)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 border border-[#1f1f1f] hover:bg-[#09090B] hover:text-white rounded-sm text-[#A1A1AA] transition-colors"
                    >
                      <FileText className="h-3.5 w-3.5" />
                      <span>Download PDF</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
