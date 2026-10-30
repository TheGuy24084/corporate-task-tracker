import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckSquare, Sparkles, Sun, Moon, ChevronDown } from 'lucide-react';
import { useAuth } from '../AuthContext';
import { useTheme } from '../context/ThemeContext';

// Continuous convoy of 3D Task & Sprint modules along the central workflow spine
const WORKFLOW_MODULES = [
  {
    code: 'TSK-101',
    title: 'Sprint Backlog Init',
    status: 'READY',
    statusColor: '#3b82f6',
    pts: '3 SP',
    progress: 0.3,
    avatarBg: '#3b82f6',
    avatarText: 'SB'
  },
  {
    code: 'TSK-102',
    title: 'Database Pipeline',
    status: 'IN PROGRESS',
    statusColor: '#06b6d4',
    pts: '5 SP',
    progress: 0.65,
    avatarBg: '#06b6d4',
    avatarText: 'DP'
  },
  {
    code: 'SPRINT 01',
    title: 'Core Architecture',
    status: 'COMPLETE',
    statusColor: '#10b981',
    pts: '24 SP',
    progress: 1.0,
    avatarBg: '#6366f1',
    avatarText: 'CA'
  },
  {
    code: 'TSK-104',
    title: 'JWT Auth & Guards',
    status: 'DONE',
    statusColor: '#10b981',
    pts: '5 SP',
    progress: 1.0,
    avatarBg: '#06b6d4',
    avatarText: 'AG'
  },
  {
    code: 'TSK-128',
    title: 'Kanban Column Sync',
    status: 'DONE',
    statusColor: '#10b981',
    pts: '8 SP',
    progress: 1.0,
    avatarBg: '#ec4899',
    avatarText: 'KB'
  },
  {
    code: 'SPRINT 02',
    title: 'Velocity Tracking',
    status: 'COMPLETE',
    statusColor: '#10b981',
    pts: '38 SP',
    progress: 1.0,
    avatarBg: '#8b5cf6',
    avatarText: 'VT'
  },
  {
    code: 'TSK-215',
    title: 'RBAC Permission Matrix',
    status: 'DONE',
    statusColor: '#10b981',
    pts: '8 SP',
    progress: 1.0,
    avatarBg: '#3b82f6',
    avatarText: 'PM'
  },
  {
    code: 'TSK-280',
    title: 'Automated Email Invites',
    status: 'REVIEW',
    statusColor: '#f59e0b',
    pts: '5 SP',
    progress: 0.9,
    avatarBg: '#f59e0b',
    avatarText: 'EI'
  },
  {
    code: 'MILESTONE',
    title: 'Security Audit v1.0',
    status: 'PASSED',
    statusColor: '#10b981',
    pts: 'AUDIT',
    progress: 1.0,
    avatarBg: '#10b981',
    avatarText: 'SA'
  },
  {
    code: 'TSK-310',
    title: '@Mention Notification Sync',
    status: 'IN PROGRESS',
    statusColor: '#3b82f6',
    pts: '5 SP',
    progress: 0.75,
    avatarBg: '#8b5cf6',
    avatarText: 'MS'
  },
  {
    code: 'TSK-364',
    title: 'Sprint Backlog Refactor',
    status: 'IN PROGRESS',
    statusColor: '#3b82f6',
    pts: '8 SP',
    progress: 0.8,
    avatarBg: '#06b6d4',
    avatarText: 'BR'
  },
  {
    code: 'SPRINT 03',
    title: 'Release Candidate 1',
    status: 'ACTIVE',
    statusColor: '#8b5cf6',
    pts: '45 SP',
    progress: 0.95,
    avatarBg: '#6366f1',
    avatarText: 'RC'
  },
  {
    code: 'TSK-408',
    title: 'E2E Testing & CI/CD',
    status: 'DONE',
    statusColor: '#10b981',
    pts: '8 SP',
    progress: 1.0,
    avatarBg: '#10b981',
    avatarText: 'TS'
  },
  {
    code: 'TSK-450',
    title: 'Milestone Timelines',
    status: 'FINALIZING',
    statusColor: '#06b6d4',
    pts: '3 SP',
    progress: 0.95,
    avatarBg: '#ec4899',
    avatarText: 'MT'
  },
  {
    code: 'RELEASE',
    title: 'V2 Production Workspace',
    status: 'LAUNCHED / COMPLETED',
    statusColor: '#10b981',
    pts: '100%',
    progress: 1.0,
    avatarBg: '#fbbf24',
    avatarText: 'GO',
    isApex: true
  }
];

// 45 Multi-depth ambient glowing dust / node particles for sideline depth
const AMBIENT_PARTICLES = Array.from({ length: 45 }, (_, i) => {
  const seedX = ((i * 137.508) % 100) / 100;
  const seedY = ((i * 223.719) % 100) / 100;
  const depth = 0.4 + (((i * 59.3) % 100) / 100) * 1.1; // 0.4 to 1.5
  const radius = 0.8 + (((i * 31.7) % 100) / 100) * 1.5; // 0.8 to 2.3
  const isCyan = i % 2 === 0;
  return { seedX, seedY, depth, radius, isCyan };
});

// Floating Sideline Micro-Telemetry HUD Cards (Parallax Layer)
const TELEMETRY_HUD_ITEMS = [
  {
    side: 'left',
    xNorm: 0.14,
    worldYNorm: 0.14,
    speed: 0.6,
    label: 'REST API • 12ms',
    tag: 'LATENCY',
    statusColor: '#10b981',
    sparkline: [3, 7, 4, 8, 5, 9, 7],
    hasSparkline: true
  },
  {
    side: 'right',
    xNorm: 0.82,
    worldYNorm: 0.25,
    speed: 1.4,
    label: 'JWT VERIFIED • 200 OK',
    tag: 'AUTH GUARD',
    statusColor: '#06b6d4',
    hasRing: true
  },
  {
    side: 'left',
    xNorm: 0.18,
    worldYNorm: 0.45,
    speed: 1.4,
    label: 'SPRINT VELOCITY: 94%',
    tag: 'BURNDOWN',
    statusColor: '#8b5cf6',
    sparkline: [2, 5, 4, 7, 6, 8, 9],
    hasSparkline: true
  },
  {
    side: 'right',
    xNorm: 0.84,
    worldYNorm: 0.62,
    speed: 0.6,
    label: '@MENTION DISPATCHED',
    tag: 'NOTIFICATIONS',
    statusColor: '#f59e0b',
    hasRing: true
  },
  {
    side: 'left',
    xNorm: 0.15,
    worldYNorm: 0.78,
    speed: 0.6,
    label: 'MONGODB SYNCED',
    tag: 'CLUSTER',
    statusColor: '#10b981',
    sparkline: [4, 6, 5, 8, 7, 9, 8],
    hasSparkline: true
  },
  {
    side: 'right',
    xNorm: 0.80,
    worldYNorm: 0.90,
    speed: 1.4,
    label: 'CI/CD PIPELINE • 100%',
    tag: 'RELEASE',
    statusColor: '#3b82f6',
    hasRing: true
  }
];

function drawRoundedRect(ctx, x, y, width, height, radius) {
  if (ctx.roundRect) {
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, radius);
  } else {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }
}

export default function LandingPage() {
  const canvasRef = useRef(null);
  const trackRef = useRef(null);
  const scrollIndicatorRef = useRef(null);
  const headerRef = useRef(null);
  const { isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();

  // The 3D Workflow Spine & Task Stream Canvas Renderer
  const drawWorkflowSpineScene = (
    ctx,
    width,
    height,
    cur,
    animTime = typeof performance !== 'undefined' ? performance.now() * 0.001 : 0
  ) => {
    ctx.clearRect(0, 0, width, height);

    // 1. Deep Obsidian Background (#0a0b0c) with subtle depth glow
    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    bgGrad.addColorStop(0, '#07080a');
    bgGrad.addColorStop(0.5, '#0a0b0c');
    bgGrad.addColorStop(1, '#0e1118');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    const cx = width * 0.5;
    const u =
      width <= 609
        ? Math.min(width / 390, 1.6)
        : Math.min(height / 800, width / 716);

    // 2. Perspective Dot/Grid Matrix Receding toward Central Spine
    ctx.save();
    const vanishingY = -height * 0.15;
    const numPerspectiveLines = 14;

    for (let i = 0; i < numPerspectiveLines; i++) {
      const bottomX = (width / (numPerspectiveLines - 1)) * i;
      ctx.beginPath();
      ctx.moveTo(cx, vanishingY);
      ctx.lineTo(bottomX, height);
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.05)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Horizontal depth rings
    const numHorizontalRings = 16;
    for (let j = 1; j <= numHorizontalRings; j++) {
      const t = j / numHorizontalRings;
      const y = Math.pow(t, 1.6) * height;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.04)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Subtle glow dots along grid intersections
      for (let k = 0; k < numPerspectiveLines; k += 2) {
        const bottomX = (width / (numPerspectiveLines - 1)) * k;
        const dotX = cx + (bottomX - cx) * (y / height);
        ctx.fillStyle = 'rgba(147, 197, 253, 0.16)';
        ctx.beginPath();
        ctx.arc(dotX, y, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();

    // Fade factor for Phase 1 sideline effects before cloud takeover
    const phase1Fade = cur < 0.46 ? 1 : Math.max(0, 1 - (cur - 0.46) / 0.06);

    // 2b. Sideline Ambient Radial Auroras & 45 Depth Particles (Phase 1)
    if (phase1Fade > 0.01) {
      ctx.save();
      ctx.globalAlpha = phase1Fade;

      // Left Indigo Aurora: slow drifting radial glow
      const leftAuroraY = height * 0.42 + Math.sin(animTime * 0.6) * 45;
      const leftGrad = ctx.createRadialGradient(
        width * 0.16,
        leftAuroraY,
        15,
        width * 0.16,
        leftAuroraY,
        Math.max(width * 0.38, 260)
      );
      leftGrad.addColorStop(0, 'rgba(99, 102, 241, 0.14)');
      leftGrad.addColorStop(0.5, 'rgba(99, 102, 241, 0.06)');
      leftGrad.addColorStop(1, 'rgba(99, 102, 241, 0)');
      ctx.fillStyle = leftGrad;
      ctx.beginPath();
      ctx.arc(width * 0.16, leftAuroraY, Math.max(width * 0.38, 260), 0, Math.PI * 2);
      ctx.fill();

      // Right Emerald/Cyan Aurora: slow drifting radial glow
      const rightAuroraY = height * 0.58 + Math.cos(animTime * 0.5) * 45;
      const rightGrad = ctx.createRadialGradient(
        width * 0.84,
        rightAuroraY,
        15,
        width * 0.84,
        rightAuroraY,
        Math.max(width * 0.38, 260)
      );
      rightGrad.addColorStop(0, 'rgba(16, 185, 129, 0.11)');
      rightGrad.addColorStop(0.5, 'rgba(6, 182, 212, 0.05)');
      rightGrad.addColorStop(1, 'rgba(16, 185, 129, 0)');
      ctx.fillStyle = rightGrad;
      ctx.beginPath();
      ctx.arc(width * 0.84, rightAuroraY, Math.max(width * 0.38, 260), 0, Math.PI * 2);
      ctx.fill();

      // 45 Multi-depth glowing dust/node particles with vertical parallax motion trails
      for (let pIdx = 0; pIdx < AMBIENT_PARTICLES.length; pIdx++) {
        const pt = AMBIENT_PARTICLES[pIdx];
        const px = pt.seedX * width;
        const py =
          ((pt.seedY * height - (cur * height * 2.8 + animTime * 22) * pt.depth) % height + height) % height;

        ctx.fillStyle = pt.isCyan ? 'rgba(56, 189, 248, 0.55)' : 'rgba(167, 139, 250, 0.55)';
        ctx.shadowColor = pt.isCyan ? 'rgba(56, 189, 248, 0.85)' : 'rgba(167, 139, 250, 0.85)';
        ctx.shadowBlur = 5 * pt.depth;
        ctx.beginPath();
        ctx.arc(px, py, pt.radius * pt.depth, 0, Math.PI * 2);
        ctx.fill();

        // Subtle vertical parallax trail
        ctx.strokeStyle = pt.isCyan ? 'rgba(56, 189, 248, 0.18)' : 'rgba(167, 139, 250, 0.18)';
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(px, py + 8 * pt.depth);
        ctx.stroke();
      }
      ctx.shadowBlur = 0;
      ctx.restore();
    }

    // 3. Central Glowing Workflow Spine Track
    ctx.save();
    const railOffset = Math.round(58 * u);

    // Outer neon bloom for the spine
    ctx.strokeStyle = 'rgba(99, 102, 241, 0.22)';
    ctx.lineWidth = 6;
    ctx.shadowColor = 'rgba(56, 189, 248, 0.5)';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.moveTo(cx - railOffset, 0);
    ctx.lineTo(cx - railOffset, height);
    ctx.moveTo(cx + railOffset, 0);
    ctx.lineTo(cx + railOffset, height);
    ctx.stroke();

    // Core crisp neon rails
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.65)';
    ctx.lineWidth = 1.5;
    ctx.shadowBlur = 0;
    ctx.beginPath();
    ctx.moveTo(cx - railOffset, 0);
    ctx.lineTo(cx - railOffset, height);
    ctx.moveTo(cx + railOffset, 0);
    ctx.lineTo(cx + railOffset, height);
    ctx.stroke();

    // Central dashed timeline spine
    ctx.setLineDash([6, 10]);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(cx, 0);
    ctx.lineTo(cx, height);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();

    // 4. Vertical Convoy of 3D Task & Sprint Modules (`width ~ 110u`)
    const modWidth = Math.min(Math.max(Math.round(110 * u), 115), 180);
    const modHeight = Math.round(modWidth * 0.52);
    const numModules = WORKFLOW_MODULES.length;
    const moduleSpacing = Math.round(modHeight * 2.3);
    const startCenterY = height * 0.92;
    const targetApexY = height * 0.46;
    const apexWorldY = (numModules - 1) * moduleSpacing;
    const totalClimb = apexWorldY - (startCenterY - targetApexY);

    // Camera climb computation: Phase 1 (0.00 to 0.46)
    let climbProgress;
    if (cur < 0.46) {
      climbProgress = cur / 0.46;
    } else {
      // Breaching above the apex node
      climbProgress = 1.0 + ((cur - 0.46) / 0.54) * 0.85;
    }

    const currentCameraY = climbProgress * totalClimb;

    // Render each Task/Sprint Module in sequence
    for (let i = 0; i < numModules; i++) {
      const m = WORKFLOW_MODULES[i];
      const moduleWorldY = i * moduleSpacing;
      const screenY = startCenterY - (moduleWorldY - currentCameraY);

      // Frustum culling
      if (screenY + modHeight < -60 || screenY - modHeight > height + 60) {
        continue;
      }

      const modX = Math.round(cx - modWidth * 0.5);
      const modY = Math.round(screenY - modHeight * 0.5);

      // Connector struts linking module to central spine rails
      ctx.save();
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx - railOffset, screenY);
      ctx.lineTo(modX, screenY);
      ctx.moveTo(modX + modWidth, screenY);
      ctx.lineTo(cx + railOffset, screenY);
      ctx.stroke();

      // Connector junction nodes
      ctx.fillStyle = m.statusColor;
      ctx.shadowColor = m.statusColor;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(cx - railOffset, screenY, 3, 0, Math.PI * 2);
      ctx.arc(cx + railOffset, screenY, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Horizontal Branching Circuit/Git Traces & Inward Data Packets (Phase 1)
      if (phase1Fade > 0.01) {
        ctx.save();
        ctx.globalAlpha = phase1Fade;

        // Left branch geometry
        const bw1 = Math.round((36 + ((i * 13) % 24)) * u);
        const bdirY = i % 2 === 0 ? -1 : 1;
        const bdiag = Math.round(20 * u);
        const bw3 = Math.round((30 + ((i * 17) % 28)) * u);

        const lp0x = cx - railOffset;
        const lp0y = screenY;
        const lp1x = lp0x - bw1;
        const lp1y = lp0y;
        const lp2x = lp1x - bdiag;
        const lp2y = lp1y + bdirY * bdiag;
        const lp3x = lp2x - bw3;
        const lp3y = lp2y;

        // Draw left circuit branch
        ctx.strokeStyle =
          i % 2 === 0 ? 'rgba(56, 189, 248, 0.18)' : 'rgba(139, 92, 246, 0.18)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(lp0x, lp0y);
        ctx.lineTo(lp1x, lp1y);
        ctx.lineTo(lp2x, lp2y);
        ctx.lineTo(lp3x, lp3y);
        ctx.stroke();

        // Terminal micro-node dot
        ctx.fillStyle =
          i % 2 === 0 ? 'rgba(56, 189, 248, 0.65)' : 'rgba(139, 92, 246, 0.65)';
        ctx.beginPath();
        ctx.arc(lp3x, lp3y, 2.2, 0, Math.PI * 2);
        ctx.fill();

        // Right branch geometry
        const rbw1 = Math.round((36 + ((i * 19) % 24)) * u);
        const rbdirY = i % 2 === 0 ? 1 : -1;
        const rbdiag = Math.round(20 * u);
        const rbw3 = Math.round((30 + ((i * 23) % 28)) * u);

        const rp0x = cx + railOffset;
        const rp0y = screenY;
        const rp1x = rp0x + rbw1;
        const rp1y = rp0y;
        const rp2x = rp1x + rbdiag;
        const rp2y = rp1y + rbdirY * rbdiag;
        const rp3x = rp2x + rbw3;
        const rp3y = rp2y;

        // Draw right circuit branch
        ctx.beginPath();
        ctx.moveTo(rp0x, rp0y);
        ctx.lineTo(rp1x, rp1y);
        ctx.lineTo(rp2x, rp2y);
        ctx.lineTo(rp3x, rp3y);
        ctx.stroke();

        // Terminal micro-node dot
        ctx.beginPath();
        ctx.arc(rp3x, rp3y, 2.2, 0, Math.PI * 2);
        ctx.fill();

        // Inward Traveling Glowing Data Packets with Trailing Tails
        // Left packet traveling inward: Outer Tip P3 -> P2 -> P1 -> Rail P0
        const lseg1 = bw3;
        const lseg2 = Math.hypot(lp1x - lp2x, lp1y - lp2y);
        const lseg3 = bw1;
        const lTotal = lseg1 + lseg2 + lseg3;
        const lpktProgress = (animTime * 0.75 + i * 0.27 + cur * 6.5) % 1.0;
        const lDist = lpktProgress * lTotal;

        let lpktX = lp3x;
        let lpktY = lp3y;
        if (lDist <= lseg1) {
          const f = lDist / lseg1;
          lpktX = lp3x + (lp2x - lp3x) * f;
          lpktY = lp3y + (lp2y - lp3y) * f;
        } else if (lDist <= lseg1 + lseg2) {
          const f = (lDist - lseg1) / lseg2;
          lpktX = lp2x + (lp1x - lp2x) * f;
          lpktY = lp2y + (lp1y - lp2y) * f;
        } else {
          const f = (lDist - lseg1 - lseg2) / lseg3;
          lpktX = lp1x + (lp0x - lp1x) * f;
          lpktY = lp1y + (lp0y - lp1y) * f;
        }

        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = i % 2 === 0 ? '#38bdf8' : '#a855f7';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(lpktX, lpktY, 2.2, 0, Math.PI * 2);
        ctx.fill();

        // Right packet traveling inward: Outer Tip RP3 -> RP2 -> RP1 -> Rail RP0
        const rseg1 = rbw3;
        const rseg2 = Math.hypot(rp1x - rp2x, rp1y - rp2y);
        const rseg3 = rbw1;
        const rTotal = rseg1 + rseg2 + rseg3;
        const rpktProgress = (animTime * 0.75 + i * 0.33 + cur * 6.5) % 1.0;
        const rDist = rpktProgress * rTotal;

        let rpktX = rp3x;
        let rpktY = rp3y;
        if (rDist <= rseg1) {
          const f = rDist / rseg1;
          rpktX = rp3x + (rp2x - rp3x) * f;
          rpktY = rp3y + (rp2y - rp3y) * f;
        } else if (rDist <= rseg1 + rseg2) {
          const f = (rDist - rseg1) / rseg2;
          rpktX = rp2x + (rp1x - rp2x) * f;
          rpktY = rp2y + (rp1y - rp2y) * f;
        } else {
          const f = (rDist - rseg1 - rseg2) / rseg3;
          rpktX = rp1x + (rp0x - rp1x) * f;
          rpktY = rp1y + (rp0y - rp1y) * f;
        }

        ctx.beginPath();
        ctx.arc(rpktX, rpktY, 2.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.restore();
      }

      // Module Glassmorphic Body
      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
      ctx.shadowBlur = 14;
      ctx.shadowOffsetY = 4;

      const cardGrad = ctx.createLinearGradient(modX, modY, modX, modY + modHeight);
      if (m.isApex) {
        cardGrad.addColorStop(0, 'rgba(30, 41, 59, 0.96)');
        cardGrad.addColorStop(1, 'rgba(15, 23, 42, 0.98)');
      } else {
        cardGrad.addColorStop(0, 'rgba(23, 30, 46, 0.92)');
        cardGrad.addColorStop(1, 'rgba(11, 16, 28, 0.95)');
      }
      ctx.fillStyle = cardGrad;
      drawRoundedRect(ctx, modX, modY, modWidth, modHeight, 8);
      ctx.fill();

      // Specular border
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;
      ctx.strokeStyle = m.isApex
        ? 'rgba(251, 191, 36, 0.75)'
        : 'rgba(255, 255, 255, 0.16)';
      ctx.lineWidth = m.isApex ? 1.8 : 1.1;
      ctx.stroke();

      // Left Accent Color Indicator
      ctx.fillStyle = m.statusColor;
      ctx.shadowColor = m.statusColor;
      ctx.shadowBlur = 6;
      drawRoundedRect(ctx, modX + 4, modY + 6, 3, modHeight - 12, 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Module Typography & Content
      const contentLeft = modX + 12;

      // Row 1: Code and Status Pill
      ctx.fillStyle = '#ffffff';
      ctx.font = `700 ${Math.max(Math.round(8.5 * u), 9)}px 'Exo 2', sans-serif`;
      ctx.fillText(m.code, contentLeft, modY + 14 * u);

      // Status pill background
      const pillWidth = Math.round(44 * u);
      const pillHeight = Math.round(11 * u);
      const pillX = modX + modWidth - pillWidth - 6;
      const pillY = modY + 5;

      ctx.fillStyle = `${m.statusColor}28`;
      drawRoundedRect(ctx, pillX, pillY, pillWidth, pillHeight, 3);
      ctx.fill();

      ctx.fillStyle = m.statusColor;
      ctx.font = `700 ${Math.max(Math.round(6.5 * u), 7)}px 'Public Sans', sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(m.status, pillX + pillWidth * 0.5, pillY + pillHeight * 0.75);
      ctx.textAlign = 'left';

      // Row 2: Title
      ctx.fillStyle = 'rgba(247, 245, 239, 0.9)';
      ctx.font = `600 ${Math.max(Math.round(7.5 * u), 8)}px 'Public Sans', sans-serif`;
      const displayTitle =
        m.title.length > 20 ? `${m.title.slice(0, 19)}…` : m.title;
      ctx.fillText(displayTitle, contentLeft, modY + 28 * u);

      // Row 3: Story Points, Progress Bar & Avatar
      // Story Points
      ctx.fillStyle = 'rgba(148, 163, 184, 0.85)';
      ctx.font = `500 ${Math.max(Math.round(6.5 * u), 7)}px 'Public Sans', sans-serif`;
      ctx.fillText(m.pts, contentLeft, modY + modHeight - 7);

      // Progress bar track
      const barX = contentLeft + Math.round(30 * u);
      const barY = modY + modHeight - 11;
      const barWidth = Math.round(modWidth * 0.32);
      const barHeight = Math.max(Math.round(2.5 * u), 2);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
      drawRoundedRect(ctx, barX, barY, barWidth, barHeight, 1.5);
      ctx.fill();

      // Progress bar fill
      ctx.fillStyle = m.statusColor;
      drawRoundedRect(
        ctx,
        barX,
        barY,
        Math.max(barWidth * m.progress, 2),
        barHeight,
        1.5
      );
      ctx.fill();

      // Avatar circle
      const avatarR = Math.round(5.5 * u);
      const avatarX = modX + modWidth - avatarR - 8;
      const avatarY = modY + modHeight - avatarR - 5;

      ctx.fillStyle = m.avatarBg;
      ctx.beginPath();
      ctx.arc(avatarX, avatarY, avatarR, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = `700 ${Math.max(Math.round(5 * u), 5)}px 'Public Sans', sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(m.avatarText, avatarX, avatarY + avatarR * 0.35);
      ctx.textAlign = 'left';

      // Apex Node Extra Visual Flare
      if (m.isApex) {
        ctx.strokeStyle = 'rgba(251, 191, 36, 0.4)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(cx, screenY, modWidth * 0.65, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = 'rgba(16, 185, 129, 0.35)';
        ctx.beginPath();
        ctx.arc(cx, screenY, modWidth * 0.8, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.restore();
    }

    // 4b. Floating Sideline Micro-Telemetry HUD Cards (Parallax Layer in Phase 1)
    if (phase1Fade > 0.01) {
      ctx.save();
      ctx.globalAlpha = phase1Fade;

      for (let hIdx = 0; hIdx < TELEMETRY_HUD_ITEMS.length; hIdx++) {
        const item = TELEMETRY_HUD_ITEMS[hIdx];
        const itemCameraY = climbProgress * totalClimb * item.speed;
        const worldY = item.worldYNorm * totalClimb;
        const hudY = startCenterY - (worldY - itemCameraY);

        // Cull out of viewport
        if (hudY + 50 < 0 || hudY - 50 > height) continue;

        const cardW = Math.min(Math.max(Math.round(84 * u), 125), 165);
        const cardH = Math.round(cardW * 0.32);
        const cardX =
          item.side === 'left'
            ? Math.round(Math.min(width * item.xNorm, cx - railOffset - cardW - 16))
            : Math.round(Math.max(width * item.xNorm, cx + railOffset + 16));

        // Skip if off screen horizontally
        if (cardX < 4 || cardX + cardW > width - 4) continue;

        // Faint dotted leader line linking card to central spine rail
        ctx.save();
        ctx.setLineDash([2, 4]);
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.15)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        if (item.side === 'left') {
          ctx.moveTo(cardX + cardW, hudY);
          ctx.lineTo(cx - railOffset, hudY + 12);
        } else {
          ctx.moveTo(cardX, hudY);
          ctx.lineTo(cx + railOffset, hudY - 12);
        }
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();

        // Card Glassmorphic Body
        ctx.save();
        ctx.fillStyle = 'rgba(12, 17, 29, 0.78)';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 10;
        drawRoundedRect(ctx, cardX, hudY - cardH * 0.5, cardW, cardH, 6);
        ctx.fill();

        // Border
        ctx.shadowBlur = 0;
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.22)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Status indicator dot
        const dotX = cardX + 10;
        const dotY = hudY - cardH * 0.5 + cardH * 0.36;
        ctx.fillStyle = item.statusColor;
        ctx.shadowColor = item.statusColor;
        ctx.shadowBlur = 5;
        ctx.beginPath();
        ctx.arc(dotX, dotY, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Tag label (small upper text)
        ctx.fillStyle = 'rgba(148, 163, 184, 0.75)';
        ctx.font = `600 ${Math.max(Math.round(5.5 * u), 6)}px 'Public Sans', sans-serif`;
        ctx.fillText(item.tag, cardX + 18, dotY + 2.5);

        // Status pill / main text
        ctx.fillStyle = '#ffffff';
        ctx.font = `700 ${Math.max(Math.round(6.5 * u), 7.5)}px 'Public Sans', sans-serif`;
        ctx.fillText(item.label, cardX + 10, hudY + cardH * 0.32);

        // Sparkline Graph (if present)
        if (item.hasSparkline && item.sparkline) {
          const spW = Math.round(cardW * 0.26);
          const spH = Math.round(cardH * 0.42);
          const spX = cardX + cardW - spW - 8;
          const spY = hudY - spH * 0.5;

          ctx.strokeStyle = item.statusColor;
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          const pts = item.sparkline;
          const maxVal = 10;
          for (let pIdx = 0; pIdx < pts.length; pIdx++) {
            const px = spX + (spW / (pts.length - 1)) * pIdx;
            const py = spY + spH - (pts[pIdx] / maxVal) * spH;
            if (pIdx === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.stroke();

          // Sparkline Apex Glowing Dot
          const lastIdx = pts.length - 1;
          const lastX = spX + spW;
          const lastY = spY + spH - (pts[lastIdx] / maxVal) * spH;
          ctx.fillStyle = '#ffffff';
          ctx.shadowColor = item.statusColor;
          ctx.shadowBlur = 4;
          ctx.beginPath();
          ctx.arc(lastX, lastY, 1.8, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        }

        // Connection Ring (if present)
        if (item.hasRing) {
          const ringR = Math.round(cardH * 0.28);
          const ringX = cardX + cardW - ringR - 8;
          const ringY = hudY;

          ctx.strokeStyle = `${item.statusColor}66`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(ringX, ringY, ringR, 0, Math.PI * 2);
          ctx.stroke();

          // Inner pulsing ring
          const innerR = ringR * (0.4 + Math.sin(animTime * 3) * 0.15);
          ctx.fillStyle = item.statusColor;
          ctx.shadowColor = item.statusColor;
          ctx.shadowBlur = 4;
          ctx.beginPath();
          ctx.arc(ringX, ringY, innerR, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        }

        ctx.restore();
      }
      ctx.restore();
    }

    // 5. Subtle Atmospheric Mist Drifting across track (Phase 1)
    if (cur < 0.52) {
      const mistAlpha =
        Math.min(cur / 0.35, 1) * Math.max(0, 1 - (cur - 0.35) / 0.17);
      if (mistAlpha > 0) {
        ctx.save();
        const mistGrad = ctx.createLinearGradient(
          0,
          height * 0.32,
          0,
          height * 0.68
        );
        mistGrad.addColorStop(0, 'rgba(226, 222, 221, 0)');
        mistGrad.addColorStop(0.5, `rgba(226, 222, 221, ${0.14 * mistAlpha})`);
        mistGrad.addColorStop(1, 'rgba(226, 222, 221, 0)');
        ctx.fillStyle = mistGrad;
        ctx.fillRect(0, height * 0.3, width, height * 0.4);
        ctx.restore();
      }
    }

    // 6. Phase 2 (0.46 to 1.00) — Cloud Takeover into Solid #e2dedd
    if (cur >= 0.44) {
      const cloudProgress = Math.min(Math.max((cur - 0.44) / (1 - 0.44), 0), 1);
      ctx.save();

      // Volumetric cloud bank layers
      const numPuffs = 12;
      for (let p = 0; p < numPuffs; p++) {
        const px = (width / (numPuffs - 1)) * p;
        const py = height * (1 - cloudProgress * 1.12) + Math.sin(p * 1.7) * 55;
        const r = Math.max(width * 0.36, 320);

        const puffGrad = ctx.createRadialGradient(px, py, r * 0.08, px, py, r);
        puffGrad.addColorStop(
          0,
          `rgba(226, 222, 221, ${Math.min(cloudProgress * 0.95, 0.92)})`
        );
        puffGrad.addColorStop(
          0.6,
          `rgba(226, 222, 221, ${Math.min(cloudProgress * 0.78, 0.75)})`
        );
        puffGrad.addColorStop(1, 'rgba(226, 222, 221, 0)');

        ctx.fillStyle = puffGrad;
        ctx.beginPath();
        ctx.arc(px, py, r, 0, Math.PI * 2);
        ctx.fill();
      }

      // Encroaching side fog blankets
      const leftFog = ctx.createLinearGradient(0, 0, width * 0.5, 0);
      leftFog.addColorStop(
        0,
        `rgba(226, 222, 221, ${Math.min(cloudProgress * 1.15, 1)})`
      );
      leftFog.addColorStop(1, 'rgba(226, 222, 221, 0)');
      ctx.fillStyle = leftFog;
      ctx.fillRect(0, 0, width * 0.5, height);

      const rightFog = ctx.createLinearGradient(width, 0, width * 0.5, 0);
      rightFog.addColorStop(
        0,
        `rgba(226, 222, 221, ${Math.min(cloudProgress * 1.15, 1)})`
      );
      rightFog.addColorStop(1, 'rgba(226, 222, 221, 0)');
      ctx.fillStyle = rightFog;
      ctx.fillRect(width * 0.5, 0, width * 0.5, height);

      // Solid soft cloud cover at 1.00 -> completely merges with #e2dedd
      if (cloudProgress > 0.42) {
        const solidAlpha = Math.min((cloudProgress - 0.42) / 0.58, 1);
        ctx.fillStyle = `rgba(226, 222, 221, ${solidAlpha})`;
        ctx.fillRect(0, 0, width, height);
      }
      ctx.restore();
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const track = trackRef.current;
    if (!canvas || !track) return;

    let animationFrameId;
    let cur = 0;
    const knee = 0.74;

    const handleCanvasResize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
    };

    handleCanvasResize();
    window.addEventListener('resize', handleCanvasResize);

    const scrubLoop = () => {
      if (track) {
        const rect = track.getBoundingClientRect();
        const maxScroll = rect.height - window.innerHeight;
        if (maxScroll > 0) {
          const rawP = Math.min(Math.max(-rect.top / maxScroll, 0), 1);
          const mappedP =
            rawP < knee
              ? (rawP / knee) * 0.46
              : 0.46 + ((rawP - knee) / (1 - knee)) * 0.54;

          cur += (mappedP - cur) * 0.22;

          if (scrollIndicatorRef.current) {
            const op = Math.max(0, 1 - cur * 14);
            scrollIndicatorRef.current.style.opacity = op;
            scrollIndicatorRef.current.style.pointerEvents = op <= 0.05 ? 'none' : 'auto';
          }

          if (headerRef.current) {
            const hAlpha = cur < 0.46 ? 1 : Math.max(0, 1 - (cur - 0.46) / 0.12);
            headerRef.current.style.opacity = hAlpha;
            headerRef.current.style.pointerEvents = hAlpha <= 0.05 ? 'none' : 'auto';
          }

          // Render 3D Workflow Spine onto Canvas
          const ctx = canvas.getContext('2d');
          if (ctx) {
            const dpr = window.devicePixelRatio || 1;
            ctx.save();
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            drawWorkflowSpineScene(
              ctx,
              window.innerWidth,
              window.innerHeight,
              cur,
              performance.now() * 0.001
            );
            ctx.restore();
          }
        }
      }
      animationFrameId = requestAnimationFrame(scrubLoop);
    };

    animationFrameId = requestAnimationFrame(scrubLoop);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleCanvasResize);
    };
  }, []);

  return (
    <div className="relative w-full bg-[#0a0b0c] text-white selection:bg-indigo-500 selection:text-white">
      {/* ====================================================================
          Sticky Track for Central Workflow Spine & Task Stream Canvas
          Track height: 2180 / 8 vh = 272.5vh
         ==================================================================== */}
      <div
        ref={trackRef}
        className="relative w-full"
        style={{ height: 'calc(2180 / 8 * 1vh)' }}
      >
        {/* Full-Viewport Sticky Container (.scene) */}
        <div className="scene sticky top-0 h-screen w-full overflow-hidden bg-[#0a0b0c]">
          {/* Interactive 3D Workflow Spine & Task Stream Canvas */}
          <canvas
            ref={canvasRef}
            className="absolute inset-0 h-full w-full object-cover pointer-events-none z-10"
          />

          {/* Cinematic Dark Vignette Gradients */}
          <div className="pointer-events-none absolute inset-0 z-15 bg-gradient-to-b from-black/75 via-transparent to-black/60" />
          <div className="pointer-events-none absolute inset-0 z-15 bg-radial-[ellipse_at_center] from-transparent via-black/20 to-black/70" />

          {/* Central Workflow Spine Alignment Axis Guide (Desktop) */}
          <div className="pointer-events-none absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2 bg-white/10 z-20 hidden md:block" />

          {/* Floating Transparent Top Bar */}
          <header
            ref={headerRef}
            className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-6 py-6 md:px-12 backdrop-blur-xs transition-opacity duration-200"
          >
            <Link
              to="/"
              className="flex items-center gap-3 group transition-transform duration-200 hover:scale-[1.02]"
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 via-indigo-600 to-cyan-400 text-white shadow-lg shadow-indigo-500/25">
                <CheckSquare className="w-5 h-5" />
              </div>
              <span className="font-['Exo_2',sans-serif] text-lg md:text-xl font-extrabold uppercase tracking-wider text-white">
                Corporate Task Tracker
              </span>
            </Link>

            <nav className="flex items-center gap-3 md:gap-4">
              {isAuthenticated ? (
                <Link
                  to="/dashboard"
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-200 hover:text-white hover:bg-white/10 backdrop-blur-md transition-all duration-150"
                >
                  Dashboard
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-200 hover:text-white hover:bg-white/10 backdrop-blur-md transition-all duration-150"
                >
                  Sign In
                </Link>
              )}
              <Link
                to={isAuthenticated ? '/dashboard' : '/register'}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 text-white shadow-lg shadow-indigo-500/30 hover:scale-[1.03] transition-all duration-200"
              >
                <span>Launch Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <button
                type="button"
                onClick={toggleTheme}
                aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 backdrop-blur-md transition-all duration-200 focus:outline-none cursor-pointer"
              >
                {theme === 'dark' ? (
                  <Sun className="w-5 h-5 text-amber-400" />
                ) : (
                  <Moon className="w-5 h-5 text-slate-200" />
                )}
              </button>
            </nav>
          </header>
        </div>

        {/* ====================================================================
            Scrolling Axis Content Blocks (.content)
           ==================================================================== */}
        <div className="content absolute inset-0 pointer-events-none w-full">
          {/* Intro Block: top calc(260 / 8 * 1vh) */}
          <div
            className="intro-block absolute left-1/2 -translate-x-1/2 w-[90vw] max-w-4xl text-center z-20 pointer-events-auto"
            style={{ top: 'calc(260 / 8 * 1vh)' }}
          >
            <div className="landing-eyebrow mb-4 inline-block px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15">
              WHY CORPORATE TASK TRACKER
            </div>
            <h1 className="landing-headline text-3xl sm:text-5xl md:text-6xl lg:text-7xl leading-[1.05]">
              WORKFLOWS <br />
              THAT WORK <br />
              AS HARD AS <br />
              YOUR TEAM.
            </h1>
          </div>

          {/* Animated Scroll Indicator: top calc(680 / 8 * 1vh) */}
          <div
            ref={scrollIndicatorRef}
            className="intro-scroll-indicator absolute left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-auto z-20 transition-opacity duration-200"
            style={{ top: 'calc(680 / 8 * 1vh)' }}
          >
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/70 backdrop-blur-md border border-cyan-500/20 shadow-lg shadow-cyan-500/10 text-slate-300">
              <span className="font-['Public_Sans',sans-serif] text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-cyan-400">
                Scroll to explore pipeline
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-cyan-400 animate-bounce" />
            </div>
          </div>

          {/* 5 Mirrored Feature Blocks Straddling the Central Workflow Axis */}
          {/* Row 1 Left: 1500/8 vh, 78u left of spine */}
          <div className="feature-block feature-block-r1-left pointer-events-auto">
            <div className="flex items-center justify-end md:justify-end gap-3 mb-3">
              <span className="font-['Exo_2',sans-serif] font-extrabold text-base sm:text-lg md:text-xl text-white uppercase tracking-tight">
                ONE UNIFIED WORKSPACE
              </span>
              <div className="w-[calc(34*var(--u))] h-[calc(34*var(--u))] min-w-[34px] min-h-[34px] flex items-center justify-center rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white p-2">
                {/* Dotted ring globe SVG */}
                <svg
                  viewBox="0 0 34 34"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-full h-full stroke-white"
                >
                  <circle
                    cx="17"
                    cy="17"
                    r="13"
                    strokeWidth="1.8"
                    strokeDasharray="3 3"
                  />
                  <ellipse cx="17" cy="17" rx="6.5" ry="13" strokeWidth="1.6" />
                  <line x1="4" y1="17" x2="30" y2="17" strokeWidth="1.6" />
                </svg>
              </div>
            </div>
            <p className="landing-body">
              No more fragmented tools. Switch between <br className="hidden sm:inline" />
              Kanban boards, Scrum sprints, and Project <br className="hidden sm:inline" />
              Management views in one place.
            </p>
          </div>

          {/* Row 1 Right: 1500/8 vh, 78u right of spine */}
          <div className="feature-block feature-block-r1-right pointer-events-auto">
            <div className="flex items-center justify-start gap-3 mb-3">
              <div className="w-[calc(34*var(--u))] h-[calc(34*var(--u))] min-w-[34px] min-h-[34px] flex items-center justify-center rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white p-2">
                {/* Three stepped blocks SVG */}
                <svg
                  viewBox="0 0 34 34"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-full h-full stroke-white"
                >
                  <rect x="5" y="16" width="6" height="12" rx="1.5" strokeWidth="1.8" />
                  <rect x="14" y="10" width="6" height="18" rx="1.5" strokeWidth="1.8" />
                  <rect x="23" y="4" width="6" height="24" rx="1.5" strokeWidth="1.8" />
                </svg>
              </div>
              <span className="font-['Exo_2',sans-serif] font-extrabold text-base sm:text-lg md:text-xl text-white uppercase tracking-tight">
                FULL SPRINT VISIBILITY
              </span>
            </div>
            <p className="landing-body">
              Track story points, velocity, and task <br className="hidden sm:inline" />
              progress in real time before bottlenecks <br className="hidden sm:inline" />
              become missed deadlines.
            </p>
          </div>

          {/* Row 2 Left: 1759/8 vh, 88u left of spine */}
          <div className="feature-block feature-block-r2-left pointer-events-auto">
            <div className="flex items-center justify-end gap-3 mb-3">
              <span className="font-['Exo_2',sans-serif] font-extrabold text-base sm:text-lg md:text-xl text-white uppercase tracking-tight">
                SECURITY YOU CAN TRUST
              </span>
              <div className="w-[calc(34*var(--u))] h-[calc(34*var(--u))] min-w-[34px] min-h-[34px] flex items-center justify-center rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white p-2">
                {/* Dotted ring check disc SVG */}
                <svg
                  viewBox="0 0 34 34"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-full h-full stroke-white"
                >
                  <circle
                    cx="17"
                    cy="17"
                    r="14"
                    strokeWidth="1.6"
                    strokeDasharray="3 3"
                  />
                  <path
                    d="M17 7L10 11V17C10 21.5 13 25.5 17 27C21 25.5 24 21.5 24 17V11L17 7Z"
                    strokeWidth="1.8"
                  />
                  <path
                    d="M13.5 17L16 19.5L20.5 14.5"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
            <p className="landing-body">
              Role-based access control and JSON Web <br className="hidden sm:inline" />
              Tokens keep Admin operations and team <br className="hidden sm:inline" />
              permissions protected at every floor.
            </p>
          </div>

          {/* Row 2 Right: 1759/8 vh, 88u right of spine */}
          <div className="feature-block feature-block-r2-right pointer-events-auto">
            <div className="flex items-center justify-start gap-3 mb-3">
              <div className="w-[calc(34*var(--u))] h-[calc(34*var(--u))] min-w-[34px] min-h-[34px] flex items-center justify-center rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white p-2">
                {/* Bold "@" / mail stroke SVG */}
                <svg
                  viewBox="0 0 34 34"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-full h-full stroke-white"
                >
                  <circle
                    cx="17"
                    cy="17"
                    r="14"
                    strokeWidth="1.6"
                    strokeDasharray="4 2"
                  />
                  <circle cx="17" cy="17" r="4.5" strokeWidth="1.8" />
                  <path
                    d="M21.5 17V19C21.5 20.8 19.8 22.5 17 22.5C13 22.5 10 19.5 10 15.5C10 11.5 13 8.5 17 8.5C21.5 8.5 23.5 12 23.5 15.5"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <span className="font-['Exo_2',sans-serif] font-extrabold text-base sm:text-lg md:text-xl text-white uppercase tracking-tight">
                INSTANT TEAM INVITES
              </span>
            </div>
            <p className="landing-body">
              Onboard members via automated email <br className="hidden sm:inline" />
              invitations and assign clear ownership <br className="hidden sm:inline" />
              to every deliverable from day one.
            </p>
          </div>

          {/* Row 3 Center: 2063/8 vh, centered on spine */}
          <div className="feature-block feature-block-r3-center pointer-events-auto">
            <div className="flex flex-col items-center justify-center gap-3 mb-3">
              <div className="w-[calc(34*var(--u))] h-[calc(34*var(--u))] min-w-[34px] min-h-[34px] flex items-center justify-center rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white p-2">
                {/* Double chevron SVG */}
                <svg
                  viewBox="0 0 34 34"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-full h-full stroke-white"
                >
                  <path
                    d="M10 10L17 17L24 10"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M10 17L17 24L24 17"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <span className="font-['Exo_2',sans-serif] font-extrabold text-base sm:text-lg md:text-2xl text-white uppercase tracking-tight">
                FAST BLOCKER RESOLUTION
              </span>
            </div>
            <p className="landing-body text-center">
              When priorities shift, we do not lose <br className="hidden sm:inline" />
              momentum. Mention teammates with @alerts <br className="hidden sm:inline" />
              to align and act at once.
            </p>
          </div>
        </div>
      </div>

      {/* ====================================================================
          After the Clouds: About Us & Testimonials Section (<section className="trust">)
          Pulled up -34vh over the sticky track with a 34vh gradient into cloud grey #e2dedd
         ==================================================================== */}
      <section
        className="trust relative z-30 w-full"
        style={{
          marginTop: '-34vh',
          backgroundColor: '#e2dedd',
          color: '#141516',
        }}
      >
        {/* 34vh Smooth Linear Gradient Transition from Transparent to Cloud Grey */}
        <div
          className="w-full pointer-events-none"
          style={{
            height: '34vh',
            background: 'linear-gradient(to bottom, transparent 0%, #e2dedd 100%)',
          }}
        />

        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 pb-28 pt-8">
          {/* Mission Block */}
          <div className="mb-20 pb-16 border-b border-[#141516]/15">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#141516]/5 border border-[#141516]/10 text-xs font-['Public_Sans',sans-serif] font-bold tracking-widest uppercase mb-6 text-[#141516]">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Our Mission & Purpose</span>
            </div>
            <p className="font-['Public_Sans',sans-serif] text-xl sm:text-2xl md:text-3xl lg:text-4xl leading-snug font-medium text-[#141516] max-w-5xl">
              Corporate Task Tracker was engineered to eliminate cross-functional friction in agile organizations. By harmonizing Kanban velocity, Scrum sprint rituals, and project roadmaps into a single real-time surface, we empower engineering leaders, product managers, and developers to build faster and ship without surprises.
            </p>
          </div>

          {/* 2-Column Section Header */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-end mb-20">
            <div className="lg:col-span-7">
              <span className="text-xs font-bold tracking-widest uppercase text-indigo-700 block mb-3 font-['Public_Sans',sans-serif]">
                Global Proof & Validation
              </span>
              <h2 className="font-['Exo_2',sans-serif] text-3xl sm:text-4xl md:text-5xl font-extrabold uppercase leading-[1.05] tracking-tight text-[#141516]">
                TRUSTED <br />
                BY ENTERPRISE TEAMS <br />
                ACROSS THE REGION
              </h2>
            </div>
            <div className="lg:col-span-5">
              <p className="font-['Public_Sans',sans-serif] text-base sm:text-lg text-[#141516]/80 leading-relaxed">
                From high-growth scaleups to distributed enterprise engineering teams, product organizations rely on Corporate Task Tracker to orchestrate complex sprints, align cross-functional stakeholders, and track deliverables with sub-second precision.
              </p>
            </div>
          </div>

          {/* 3 Editorial Quote Rows */}
          <div className="divide-y divide-[#141516]/15 border-y border-[#141516]/15 mb-20">
            {/* Quote Row 1 */}
            <div className="py-10 grid grid-cols-1 md:grid-cols-12 gap-6 items-baseline">
              <div className="md:col-span-8">
                <blockquote className="font-['Public_Sans',sans-serif] text-lg sm:text-xl font-medium text-[#141516] leading-relaxed">
                  &ldquo;Corporate Task Tracker completely replaced our fragmented toolchain. Moving between Kanban and Scrum views without losing task context has boosted our sprint delivery velocity by over 35%.&rdquo;
                </blockquote>
              </div>
              <div className="md:col-span-4 md:text-right">
                <div className="font-['Exo_2',sans-serif] font-bold text-base text-[#141516]">
                  Elena Rostova
                </div>
                <div className="text-xs font-medium text-[#141516]/70 uppercase tracking-wider font-['Public_Sans',sans-serif]">
                  VP of Engineering, CloudScale Systems
                </div>
              </div>
            </div>

            {/* Quote Row 2 */}
            <div className="py-10 grid grid-cols-1 md:grid-cols-12 gap-6 items-baseline">
              <div className="md:col-span-8">
                <blockquote className="font-['Public_Sans',sans-serif] text-lg sm:text-xl font-medium text-[#141516] leading-relaxed">
                  &ldquo;The role-based security, automated email invitations, and instant @mention synchronization give our distributed security team total peace of mind and frictionless daily standups.&rdquo;
                </blockquote>
              </div>
              <div className="md:col-span-4 md:text-right">
                <div className="font-['Exo_2',sans-serif] font-bold text-base text-[#141516]">
                  Marcus Chen
                </div>
                <div className="text-xs font-medium text-[#141516]/70 uppercase tracking-wider font-['Public_Sans',sans-serif]">
                  Principal Systems Architect, Hyperion Tech
                </div>
              </div>
            </div>

            {/* Quote Row 3 */}
            <div className="py-10 grid grid-cols-1 md:grid-cols-12 gap-6 items-baseline">
              <div className="md:col-span-8">
                <blockquote className="font-['Public_Sans',sans-serif] text-lg sm:text-xl font-medium text-[#141516] leading-relaxed">
                  &ldquo;Story points, milestone roadmaps, and real-time velocity calculations actually reflect reality. Our product managers and engineers finally share the exact same mental model.&rdquo;
                </blockquote>
              </div>
              <div className="md:col-span-4 md:text-right">
                <div className="font-['Exo_2',sans-serif] font-bold text-base text-[#141516]">
                  Sarah Jenkins
                </div>
                <div className="text-xs font-medium text-[#141516]/70 uppercase tracking-wider font-['Public_Sans',sans-serif]">
                  Head of Product, FinVerse Global
                </div>
              </div>
            </div>
          </div>

          {/* Get Started Free CTA Block */}
          <div className="rounded-3xl p-8 sm:p-12 md:p-16 bg-[#141516] text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl">
            <div className="max-w-2xl">
              <span className="text-xs font-bold uppercase tracking-widest text-indigo-400 block mb-2 font-['Public_Sans',sans-serif]">
                Ready to accelerate your cycles?
              </span>
              <h3 className="font-['Exo_2',sans-serif] text-2xl sm:text-3xl md:text-4xl font-extrabold uppercase text-white tracking-tight">
                Supercharge Your Engineering Workflow Today.
              </h3>
              <p className="mt-3 text-sm sm:text-base text-slate-300 font-['Public_Sans',sans-serif]">
                Join thousands of engineers delivering on schedule with automated sprints, Kanban flexibility, and instant collaboration.
              </p>
            </div>
            <div className="flex-shrink-0">
              <Link
                to="/register"
                className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-['Public_Sans',sans-serif] font-bold text-base bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 text-white shadow-xl shadow-indigo-500/30 hover:scale-105 transition-all duration-200"
              >
                <span>Get Started Free</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
