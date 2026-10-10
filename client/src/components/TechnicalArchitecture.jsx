import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Layers,
  Server,
  Database,
  Zap,
  ShieldCheck,
  Clock,
  Activity,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowDown,
  Play,
  Pause,
  RotateCcw,
  X,
  Monitor,
  Terminal,
  ChevronRight,
  Info,
  Maximize2,
  Github,
  ExternalLink
} from 'lucide-react';

export default function TechnicalArchitecture() {
  const [selectedNode, setSelectedNode] = useState('frontend');
  const [tracingFlow, setTracingFlow] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [showPitchModal, setShowPitchModal] = useState(false);

  // 5 Step High-Contention Booking Flow Sequence
  const flowSteps = [
    {
      id: 'step-1',
      node: 'frontend',
      label: 'Step 1: Seat Selection & Intent',
      title: 'Client Berth Selection (Frontend)',
      summary: 'Passenger selects Berth 10 (Bay 2, Middle Berth) in Sleeper Coach S3.',
      detail: 'The React UI checks local client state, formats berth metadata ("Coach S3, Bay 2, MB, Seat 10"), and enforces the 6-ticket transaction limit.',
      payload: '{ eventId: "evt_train_001", quantity: 1, selectedSeats: [10] }',
      protocol: 'Client-side State • HashRouter SPA'
    },
    {
      id: 'step-2',
      node: 'api',
      label: 'Step 2: HTTP / REST Ingress',
      title: 'Idempotent Ingress Request',
      summary: 'Frontend dispatches POST /api/holds with an idempotency key.',
      detail: 'Request passes through ApiClient with automatic request deduplication and a 3.5s timeout controller to ensure sub-second UI responsiveness.',
      payload: 'POST /api/holds HTTP/1.1\nAuthorization: Bearer <jwt_token>\nX-Idempotency-Key: idm_8f92a1',
      protocol: 'HTTPS REST • JSON Envelope'
    },
    {
      id: 'step-3',
      node: 'api',
      label: 'Step 3: Validation & Gatekeeping',
      title: 'Backend Route & Inventory Validation',
      summary: 'API validates coach range (1–72) and verifies event availability.',
      detail: 'The backend engine rejects invalid berths (seat 0, seat 73) and checks if the train capacity has available inventory before contacting data stores.',
      payload: 'seat_info(10) => { bay: 2, type: "MB", valid: true }\nInventory check: availableInventory >= 1',
      protocol: 'Node.js Express / Python Engine'
    },
    {
      id: 'step-4',
      node: 'redis',
      label: 'Step 4: Atomic Lock Acquisition',
      title: 'Atomic Redis Hold & TTL Lock',
      summary: 'Sub-millisecond inventory lock acquired with 150s auto-expiry TTL.',
      detail: 'Redis executes an atomic operation (SETNX hold:evt_001:seat_10 with EX 150). If another user attempts the same seat simultaneously, they receive 409 Conflict.',
      payload: 'SETNX hold:evt_train_001:seat_10 "usr_demo" EX 150\nDECR inventory:evt_train_001',
      protocol: 'Redis In-Memory Key-Value • Single-threaded Atomicity'
    },
    {
      id: 'step-5',
      node: 'postgres',
      label: 'Step 5: Order Commitment & Durability',
      title: 'PostgreSQL ACID Order Commitment',
      summary: 'Payment approved; permanent PNR record written to database.',
      detail: 'PostgreSQL commits a transactional record with alphanumeric PNR (e.g. LNB-729104). The temporary Redis hold is finalized, and a digital ticket voucher is issued.',
      payload: 'INSERT INTO bookings (ref, event_id, seats, status)\nVALUES (\'LNB-729104\', \'evt_train_001\', \'{10}\', \'CONFIRMED\');',
      protocol: 'PostgreSQL Relational DB • ACID Transactions'
    }
  ];

  // Auto-play flow tracing
  useEffect(() => {
    let timer;
    if (tracingFlow) {
      timer = setInterval(() => {
        setActiveStep((prev) => {
          if (prev >= flowSteps.length - 1) {
            setTracingFlow(false);
            return prev;
          }
          return prev + 1;
        });
      }, 2600);
    }
    return () => clearInterval(timer);
  }, [tracingFlow, flowSteps.length]);

  // Sync selected node with current flow step when tracing
  useEffect(() => {
    if (tracingFlow) {
      setSelectedNode(flowSteps[activeStep].node);
    }
  }, [activeStep, tracingFlow]);

  const handleStartTrace = () => {
    setActiveStep(0);
    setTracingFlow(true);
    setSelectedNode(flowSteps[0].node);
  };

  const handlePauseTrace = () => {
    setTracingFlow(false);
  };

  const handleResetTrace = () => {
    setTracingFlow(false);
    setActiveStep(0);
    setSelectedNode('frontend');
  };

  // Node Specifications
  const nodeDetails = {
    frontend: {
      title: 'React 18 + Vite Frontend',
      layer: 'Presentation & Interaction Layer',
      icon: Monitor,
      badge: 'Client SPA • Verified Working',
      responsibilities: [
        'Multi-category search across Trains, Buses, Movies, Concerts, and Sports.',
        'Interactive 72-berth 9-bay Indian Railways Sleeper (SL) layout with visual orientation.',
        'Berth type toolbar (LB, MB, UB, SL, SU) with real-time free counters & 1-click Auto-Pick.',
        'Client-side reservation countdown timer (150s TTL) with instant visual warnings.',
        'Resilient ApiClient with request deduplication, cache invalidation, and fallback adapter.'
      ],
      dataContracts: 'Out: POST /api/holds, POST /api/bookings • In: Event catalogs, hold tokens, vouchers',
      concurrencyRole: 'Immediate UI feedback, optimistic reservation locks, and automatic sweep of expired holds.',
      status: 'Implemented & Verified (10/10 Node.js unit tests passing)'
    },
    api: {
      title: 'Backend API Gateway',
      layer: 'Application & Orchestration Layer',
      icon: Server,
      badge: 'REST API • Contract Wired',
      responsibilities: [
        'Strict input validation & range enforcement (berth numbers 1–72, quantity 1–6).',
        'Reservation lifecycle coordination (Hold -> Confirm -> Cancel / Release).',
        'Authentication verification (JWT Bearer token) and Idempotency Key validation.',
        'Two-phase coordination: coordinates fast atomic lock in Redis, then durable write in Postgres.',
        'Exposes REST endpoints: /api/auth, /api/events, /api/holds, /api/bookings.'
      ],
      dataContracts: 'HTTP/1.1 REST • JSON requests/responses • Idempotency-Key headers',
      concurrencyRole: 'Gatekeeper against double-submission and orchestrator of distributed seat locks.',
      status: 'Contract Specified & Adapter Wired (Local Dev Adapter Active)'
    },
    redis: {
      title: 'Redis Fast Inventory & Lock Store',
      layer: 'Distributed In-Memory Data Store',
      icon: Zap,
      badge: 'Separate Backend Service',
      responsibilities: [
        'High-throughput inventory counters queried in sub-millisecond latency.',
        'Temporary seat reservation holds with atomic Time-To-Live (150s default).',
        'Mutual exclusion locking via single-threaded atomic primitives (SETNX / Lua scripts).',
        'Automatic expiration sweeps: expired keys release seats back into the available pool.',
        'Eliminates database row locks under massive concurrent spikes.'
      ],
      dataContracts: 'In-Memory Key-Value • Keys: hold:{event_id}:{seat_id}, inventory:{event_id}',
      concurrencyRole: 'Guarantees zero double-booking at high request volumes by serializing seat acquisition.',
      status: 'Backend Concurrency Design (Simulated via client railway engine for demo)'
    },
    postgres: {
      title: 'PostgreSQL Relational Database',
      layer: 'Persistent Storage & Durability Layer',
      icon: Database,
      badge: 'Separate Backend Service',
      responsibilities: [
        'Durable storage for confirmed bookings, user accounts, and events.',
        'Generates and records authoritative PNR reference numbers (e.g. LNB-729104).',
        'Enforces relational schema integrity: Users -> Bookings -> Reserved Seats -> Events.',
        'Audit logging for cancellations, ticket releases, and financial reconciliation.',
        'Guarantees ACID transactions so bookings survive system failures.'
      ],
      dataContracts: 'SQL Schemas • Relational tables: users, events, coach_configs, bookings, tickets',
      concurrencyRole: 'Final durability of confirmed transactions; prevents orphaned bookings or phantom seats.',
      status: 'Persistent Data Model Specification'
    }
  };

  const currentNode = nodeDetails[selectedNode] || nodeDetails.frontend;

  return (
    <section
      id="architecture"
      style={{
        padding: '5rem 0 4.5rem',
        backgroundColor: '#FFFFFF',
        borderTop: '1px solid var(--border-light)',
        borderBottom: '1px solid var(--border-light)'
      }}
    >
      <div className="container">
        {/* Section Header */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1.5rem',
          marginBottom: '3rem'
        }}>
          <div style={{ maxWidth: '680px' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.25rem 0.75rem',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--primary-light)',
              color: 'var(--primary)',
              fontSize: '0.8125rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '0.75rem'
            }}>
              <Cpu size={15} />
              <span>System Design &amp; Engineering</span>
            </div>

            <h2 style={{
              fontSize: '2.25rem',
              fontWeight: 800,
              color: 'var(--text-main)',
              letterSpacing: '-0.03em',
              lineHeight: 1.2,
              marginBottom: '0.75rem'
            }}>
              Technical Architecture &amp; Concurrency Engine
            </h2>

            <p style={{
              fontSize: '1rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.6
            }}>
              How LockNBook prevents double-booking during flash-crowd ticket drops. Interactive visualization showing client seat selection, REST ingress, in-memory atomic locks, and durable database persistence.
            </p>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            {tracingFlow ? (
              <button
                type="button"
                onClick={handlePauseTrace}
                className="btn btn-secondary btn-sm"
                style={{ gap: '0.45rem', fontWeight: 700 }}
              >
                <Pause size={15} />
                <span>Pause Trace</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleStartTrace}
                className="btn btn-secondary btn-sm"
                style={{ gap: '0.45rem', fontWeight: 700, borderColor: 'var(--primary-border)', color: 'var(--primary)' }}
              >
                <Play size={15} fill="currentColor" />
                <span>Trace Booking Flow</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setShowPitchModal(true)}
              className="btn btn-primary btn-sm"
              style={{ gap: '0.45rem', fontWeight: 700, boxShadow: '0 2px 8px rgba(37,99,235,0.25)' }}
            >
              <Maximize2 size={15} />
              <span>Technical Demo (50s Pitch)</span>
            </button>

            <a
              href="https://github.com/TejasLolge/LockNBook"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary btn-sm"
              style={{ gap: '0.45rem', fontWeight: 700 }}
              title="View LockNBook source code on GitHub"
            >
              <Github size={15} />
              <span>GitHub Repo</span>
              <ExternalLink size={12} style={{ opacity: 0.6 }} />
            </a>
          </div>
        </div>

        {/* Live Flow Trace Indicator Banner */}
        {tracingFlow && (
          <div style={{
            padding: '1rem 1.25rem',
            backgroundColor: '#EFF6FF',
            border: '1.5px solid var(--primary-border)',
            borderRadius: 'var(--radius-lg)',
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--primary)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '0.875rem'
              }}>
                {activeStep + 1}
              </div>
              <div>
                <div style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  {flowSteps[activeStep].title}
                </div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                  {flowSteps[activeStep].summary}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)' }}>
                Step {activeStep + 1} of {flowSteps.length}
              </span>
              <button
                type="button"
                onClick={handleResetTrace}
                className="btn btn-sm btn-secondary"
                style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
              >
                <RotateCcw size={12} />
                <span>Stop</span>
              </button>
            </div>
          </div>
        )}

        {/* Architecture Diagram Canvas */}
        <div style={{
          backgroundColor: '#F8FAFC',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border-light)',
          padding: '2.5rem 1.5rem',
          marginBottom: '2.5rem',
          boxShadow: 'var(--shadow-sm)'
        }}>
          {/* Top Level: React + Vite Frontend */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.25rem' }}>
            <div
              onClick={() => setSelectedNode('frontend')}
              role="button"
              tabIndex={0}
              style={{
                width: '100%',
                maxWidth: '620px',
                padding: '1.25rem 1.5rem',
                backgroundColor: selectedNode === 'frontend' ? '#FFFFFF' : '#FFFFFF',
                borderRadius: 'var(--radius-lg)',
                border: selectedNode === 'frontend' ? '2px solid var(--primary)' : '1px solid var(--border-light)',
                boxShadow: selectedNode === 'frontend' ? '0 8px 24px -4px rgba(37,99,235,0.2)' : 'var(--shadow-card)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                position: 'relative',
                transform: selectedNode === 'frontend' ? 'translateY(-2px)' : 'none'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--primary-light)',
                    color: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Monitor size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.0625rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                      React 18 + Vite Frontend
                    </h3>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                      Single Page Application (SPA) &bull; HashRouter
                    </span>
                  </div>
                </div>

                <span style={{
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  padding: '0.2rem 0.55rem',
                  borderRadius: '999px',
                  backgroundColor: '#DCFCE7',
                  color: '#16A34A',
                  border: '1px solid #BBF7D0'
                }}>
                  ● Client Layer
                </span>
              </div>

              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: '0 0 0.75rem', lineHeight: 1.5 }}>
                Interactive booking experience across Trains, Buses, Movies, Concerts &amp; Sports with Indian Railways 72-berth sleeper seat selector, berth type filters, and real-time hold timers.
              </p>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.6875rem', fontWeight: 700, backgroundColor: 'var(--bg-muted)', padding: '0.15rem 0.45rem', borderRadius: '4px', color: 'var(--text-secondary)' }}>
                  Search &amp; Filters
                </span>
                <span style={{ fontSize: '0.6875rem', fontWeight: 700, backgroundColor: 'var(--bg-muted)', padding: '0.15rem 0.45rem', borderRadius: '4px', color: 'var(--text-secondary)' }}>
                  72-Berth SL Coach Map
                </span>
                <span style={{ fontSize: '0.6875rem', fontWeight: 700, backgroundColor: 'var(--bg-muted)', padding: '0.15rem 0.45rem', borderRadius: '4px', color: 'var(--text-secondary)' }}>
                  Berth Type Auto-Pick
                </span>
                <span style={{ fontSize: '0.6875rem', fontWeight: 700, backgroundColor: 'var(--bg-muted)', padding: '0.15rem 0.45rem', borderRadius: '4px', color: 'var(--text-secondary)' }}>
                  150s Hold Countdown
                </span>
              </div>
            </div>
          </div>

          {/* Connector Down: HTTP / REST API */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            margin: '0.5rem 0'
          }}>
            <div style={{
              width: '2px',
              height: '24px',
              backgroundColor: activeStep >= 1 ? 'var(--primary)' : 'var(--border-hover)',
              transition: 'background-color 0.3s ease'
            }} />
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.2rem 0.65rem',
              borderRadius: '999px',
              backgroundColor: activeStep === 1 ? 'var(--primary)' : '#FFFFFF',
              color: activeStep === 1 ? '#FFFFFF' : 'var(--text-secondary)',
              border: '1px solid var(--border-light)',
              fontSize: '0.6875rem',
              fontWeight: 700,
              boxShadow: 'var(--shadow-sm)',
              transition: 'all 0.2s ease'
            }}>
              <span>HTTP / REST API (JSON)</span>
              <ArrowDown size={12} />
            </div>
            <div style={{
              width: '2px',
              height: '24px',
              backgroundColor: activeStep >= 2 ? 'var(--primary)' : 'var(--border-hover)',
              transition: 'background-color 0.3s ease'
            }} />
          </div>

          {/* Middle Level: Backend API */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.25rem' }}>
            <div
              onClick={() => setSelectedNode('api')}
              role="button"
              tabIndex={0}
              style={{
                width: '100%',
                maxWidth: '620px',
                padding: '1.25rem 1.5rem',
                backgroundColor: '#FFFFFF',
                borderRadius: 'var(--radius-lg)',
                border: selectedNode === 'api' ? '2px solid var(--primary)' : '1px solid var(--border-light)',
                boxShadow: selectedNode === 'api' ? '0 8px 24px -4px rgba(37,99,235,0.2)' : 'var(--shadow-card)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                transform: selectedNode === 'api' ? 'translateY(-2px)' : 'none'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: '#EFF6FF',
                    color: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Server size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.0625rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                      Backend API Gateway &amp; Engine
                    </h3>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                      Request Ingress &bull; Hold Coordinator &bull; Port 5000
                    </span>
                  </div>
                </div>

                <span style={{
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  padding: '0.2rem 0.55rem',
                  borderRadius: '999px',
                  backgroundColor: 'var(--primary-light)',
                  color: 'var(--primary)',
                  border: '1px solid var(--primary-border)'
                }}>
                  ● Application Layer
                </span>
              </div>

              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: '0 0 0.75rem', lineHeight: 1.5 }}>
                Handles route validation, client authentication, seat coordinate integrity, reservation lock issuance, and coordinates atomic fast writes with durable persistence.
              </p>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.6875rem', fontWeight: 700, backgroundColor: 'var(--bg-muted)', padding: '0.15rem 0.45rem', borderRadius: '4px', color: 'var(--text-secondary)' }}>
                  Request Validation (Seats 1–72)
                </span>
                <span style={{ fontSize: '0.6875rem', fontWeight: 700, backgroundColor: 'var(--bg-muted)', padding: '0.15rem 0.45rem', borderRadius: '4px', color: 'var(--text-secondary)' }}>
                  Reservation Lifecycle
                </span>
                <span style={{ fontSize: '0.6875rem', fontWeight: 700, backgroundColor: 'var(--bg-muted)', padding: '0.15rem 0.45rem', borderRadius: '4px', color: 'var(--text-secondary)' }}>
                  Idempotency Checking
                </span>
              </div>
            </div>
          </div>

          {/* Branching Connectors to Redis and PostgreSQL */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '12rem',
            margin: '0.5rem 0'
          }}>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}>
              <div style={{ width: '2px', height: '24px', backgroundColor: activeStep >= 3 ? 'var(--primary)' : 'var(--border-hover)' }} />
              <span style={{
                fontSize: '0.6875rem',
                fontWeight: 700,
                color: activeStep === 3 ? 'var(--primary)' : 'var(--text-muted)',
                backgroundColor: '#FFFFFF',
                padding: '0.15rem 0.5rem',
                borderRadius: '4px',
                border: '1px solid var(--border-light)'
              }}>
                Fast Lock Channel &darr;
              </span>
              <div style={{ width: '2px', height: '24px', backgroundColor: activeStep >= 3 ? 'var(--primary)' : 'var(--border-hover)' }} />
            </div>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}>
              <div style={{ width: '2px', height: '24px', backgroundColor: activeStep >= 4 ? 'var(--primary)' : 'var(--border-hover)' }} />
              <span style={{
                fontSize: '0.6875rem',
                fontWeight: 700,
                color: activeStep === 4 ? 'var(--primary)' : 'var(--text-muted)',
                backgroundColor: '#FFFFFF',
                padding: '0.15rem 0.5rem',
                borderRadius: '4px',
                border: '1px solid var(--border-light)'
              }}>
                Durable Write Channel &darr;
              </span>
              <div style={{ width: '2px', height: '24px', backgroundColor: activeStep >= 4 ? 'var(--primary)' : 'var(--border-hover)' }} />
            </div>
          </div>

          {/* Bottom Dual Services Grid: Redis (Left) & PostgreSQL (Right) */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.5rem',
            maxWidth: '920px',
            margin: '0 auto'
          }}>
            {/* Redis Service Card */}
            <div
              onClick={() => setSelectedNode('redis')}
              role="button"
              tabIndex={0}
              style={{
                padding: '1.25rem 1.5rem',
                backgroundColor: '#FFFFFF',
                borderRadius: 'var(--radius-lg)',
                border: selectedNode === 'redis' ? '2px solid #DC2626' : '1px solid var(--border-light)',
                boxShadow: selectedNode === 'redis' ? '0 8px 24px -4px rgba(220,38,38,0.2)' : 'var(--shadow-card)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                transform: selectedNode === 'redis' ? 'translateY(-2px)' : 'none'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: '#FEE2E2',
                    color: '#DC2626',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Zap size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.0625rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                      Redis
                    </h3>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                      In-Memory &bull; Atomic Distributed Locks
                    </span>
                  </div>
                </div>

                <span style={{
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  padding: '0.2rem 0.55rem',
                  borderRadius: '999px',
                  backgroundColor: '#FEF2F2',
                  color: '#DC2626',
                  border: '1px solid #FECACA'
                }}>
                  ● Service
                </span>
              </div>

              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: '0 0 0.75rem', lineHeight: 1.5 }}>
                Dedicated backend service for high-speed inventory caching, temporary seat reservation holds, and atomic updates to prevent double booking.
              </p>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.6875rem', fontWeight: 700, backgroundColor: '#FEF2F2', padding: '0.15rem 0.45rem', borderRadius: '4px', color: '#DC2626' }}>
                  Fast Inventory Ops
                </span>
                <span style={{ fontSize: '0.6875rem', fontWeight: 700, backgroundColor: '#FEF2F2', padding: '0.15rem 0.45rem', borderRadius: '4px', color: '#DC2626' }}>
                  150s Hold TTL Expiry
                </span>
                <span style={{ fontSize: '0.6875rem', fontWeight: 700, backgroundColor: '#FEF2F2', padding: '0.15rem 0.45rem', borderRadius: '4px', color: '#DC2626' }}>
                  Atomic SETNX Race Guard
                </span>
              </div>
            </div>

            {/* PostgreSQL Service Card */}
            <div
              onClick={() => setSelectedNode('postgres')}
              role="button"
              tabIndex={0}
              style={{
                padding: '1.25rem 1.5rem',
                backgroundColor: '#FFFFFF',
                borderRadius: 'var(--radius-lg)',
                border: selectedNode === 'postgres' ? '2px solid #0284C7' : '1px solid var(--border-light)',
                boxShadow: selectedNode === 'postgres' ? '0 8px 24px -4px rgba(2,132,199,0.2)' : 'var(--shadow-card)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                transform: selectedNode === 'postgres' ? 'translateY(-2px)' : 'none'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: '#E0F2FE',
                    color: '#0284C7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Database size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.0625rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                      PostgreSQL
                    </h3>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                      Relational &bull; ACID Persistent Storage
                    </span>
                  </div>
                </div>

                <span style={{
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  padding: '0.2rem 0.55rem',
                  borderRadius: '999px',
                  backgroundColor: '#F0F9FF',
                  color: '#0284C7',
                  border: '1px solid #BAE6FD'
                }}>
                  ● Service
                </span>
              </div>

              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: '0 0 0.75rem', lineHeight: 1.5 }}>
                Dedicated backend service for durable booking records, user accounts, and confirmed reservation data where supported by the backend.
              </p>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.6875rem', fontWeight: 700, backgroundColor: '#E0F2FE', padding: '0.15rem 0.45rem', borderRadius: '4px', color: '#0284C7' }}>
                  Authoritative PNR Records
                </span>
                <span style={{ fontSize: '0.6875rem', fontWeight: 700, backgroundColor: '#E0F2FE', padding: '0.15rem 0.45rem', borderRadius: '4px', color: '#0284C7' }}>
                  Relational Consistency
                </span>
                <span style={{ fontSize: '0.6875rem', fontWeight: 700, backgroundColor: '#E0F2FE', padding: '0.15rem 0.45rem', borderRadius: '4px', color: '#0284C7' }}>
                  Audit &amp; Ticket Ledger
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Selected Architecture Node Inspector Panel */}
        <div style={{
          padding: '1.75rem',
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-light)',
          boxShadow: 'var(--shadow-card)',
          marginBottom: '3.5rem'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem',
            paddingBottom: '1rem',
            borderBottom: '1px solid var(--border-light)',
            marginBottom: '1.25rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--primary-light)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <currentNode.icon size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                  {currentNode.title}
                </h3>
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                  {currentNode.layer}
                </span>
              </div>
            </div>

            <span style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              padding: '0.25rem 0.75rem',
              borderRadius: '999px',
              backgroundColor: 'var(--bg-muted)',
              color: 'var(--text-main)',
              border: '1px solid var(--border-light)'
            }}>
              {currentNode.badge}
            </span>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.75rem'
          }}>
            {/* Responsibilities Column */}
            <div>
              <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-main)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.75rem' }}>
                Core Responsibilities
              </h4>
              <ul style={{ margin: 0, paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {currentNode.responsibilities.map((r, idx) => (
                  <li key={idx} style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    {r}
                  </li>
                ))}
              </ul>
            </div>

            {/* Protocol & Concurrency Role */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ padding: '0.875rem 1rem', backgroundColor: 'var(--bg-muted)', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '0.25rem' }}>
                  Protocol &amp; Data Contract
                </span>
                <code style={{ fontSize: '0.8125rem', color: 'var(--text-main)', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                  {currentNode.dataContracts}
                </code>
              </div>

              <div style={{ padding: '0.875rem 1rem', backgroundColor: 'var(--bg-muted)', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '0.25rem' }}>
                  High-Contention Role
                </span>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                  {currentNode.concurrencyRole}
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>Status:</span>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)' }}>
                  {currentNode.status}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 4 Key Engineering Feature Cards */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>
            Key Engineering Pillars
          </h3>
          <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', marginBottom: '1.75rem' }}>
            Transparent breakdown of concurrency prevention, seat lifecycle, persistent records, and correctness verification.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '1.5rem'
        }}>
          {/* Card 1: Concurrency Protection */}
          <div className="card" style={{ padding: '1.5rem', backgroundColor: '#FFFFFF' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--primary-light)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <ShieldCheck size={22} />
              </div>
              <span style={{
                fontSize: '0.6875rem',
                fontWeight: 700,
                padding: '0.15rem 0.5rem',
                borderRadius: '999px',
                backgroundColor: '#DCFCE7',
                color: '#16A34A',
                border: '1px solid #BBF7D0'
              }}>
                Zero Double-Booking
              </span>
            </div>

            <h4 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
              Concurrency Protection
            </h4>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.55, marginBottom: '1rem' }}>
              How atomic inventory operations prevent two users from booking the same seat simultaneously. Single-threaded locking ensures that identical seat requests are strictly serialized; only the first wins the reservation lock, while competing requests receive a deterministic 409 conflict error.
            </p>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-light)', paddingTop: '0.75rem' }}>
              <strong>Status:</strong> Client hold engine verified; Redis atomic lock contract specified.
            </div>
          </div>

          {/* Card 2: Temporary Seat Holds */}
          <div className="card" style={{ padding: '1.5rem', backgroundColor: '#FFFFFF' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: '#EFF6FF',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Clock size={22} />
              </div>
              <span style={{
                fontSize: '0.6875rem',
                fontWeight: 700,
                padding: '0.15rem 0.5rem',
                borderRadius: '999px',
                backgroundColor: 'var(--primary-light)',
                color: 'var(--primary)',
                border: '1px solid var(--primary-border)'
              }}>
                150s TTL Expiry
              </span>
            </div>

            <h4 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
              Temporary Seat Holds
            </h4>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.55, marginBottom: '1rem' }}>
              When a passenger selects a berth, a temporary reservation hold is acquired with a strict Time-to-Live (default 150 seconds). If checkout is not completed within this window, the hold expires automatically, and the seats return to the available inventory pool with zero manual intervention.
            </p>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-light)', paddingTop: '0.75rem' }}>
              <strong>Status:</strong> Verified via <code>cleanExpiredHolds()</code> in engine &amp; unit tests.
            </div>
          </div>

          {/* Card 3: Reliable Booking Records */}
          <div className="card" style={{ padding: '1.5rem', backgroundColor: '#FFFFFF' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: '#E0F2FE',
                color: '#0284C7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Database size={22} />
              </div>
              <span style={{
                fontSize: '0.6875rem',
                fontWeight: 700,
                padding: '0.15rem 0.5rem',
                borderRadius: '999px',
                backgroundColor: '#E0F2FE',
                color: '#0284C7',
                border: '1px solid #BAE6FD'
              }}>
                Persistent Storage
              </span>
            </div>

            <h4 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
              Reliable Booking Records
            </h4>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.55, marginBottom: '1rem' }}>
              Persistent storage and booking state management. Once payment confirms, an authoritative alphanumeric PNR code is generated and committed to durable database storage, creating immutable tickets, attendee vouchers, and full cancellation/release audit trails.
            </p>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-light)', paddingTop: '0.75rem' }}>
              <strong>Status:</strong> Persistent schema &amp; PNR format specified for Postgres backend.
            </div>
          </div>

          {/* Card 4: Load Testing & Correctness */}
          <div className="card" style={{ padding: '1.5rem', backgroundColor: '#FFFFFF' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: '#FEF3C7',
                color: '#D97706',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Activity size={22} />
              </div>
              <span style={{
                fontSize: '0.6875rem',
                fontWeight: 700,
                padding: '0.15rem 0.5rem',
                borderRadius: '999px',
                backgroundColor: '#FEF3C7',
                color: '#D97706',
                border: '1px solid #FDE68A'
              }}>
                Correctness Strategy
              </span>
            </div>

            <h4 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
              Load Testing &amp; Correctness
            </h4>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.55, marginBottom: '1rem' }}>
              How concurrent requests and inventory consistency can be validated. Test suites verify that when N simultaneous requests target the same limited seat inventory, exactly N seats are allocated and zero overbooking occurs under contention.
            </p>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-light)', paddingTop: '0.75rem' }}>
              <strong>Status:</strong> 10/10 Python &amp; 10/10 Node.js unit tests passing; k6 load plan designed.
            </div>
          </div>
        </div>
      </div>

      {/* 50-Second Technical Demo Pitch Modal */}
      {showPitchModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(4px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.5rem'
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-xl)',
            maxWidth: '840px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '2rem',
            boxShadow: 'var(--shadow-modal)',
            position: 'relative'
          }}>
            {/* Modal Close Button */}
            <button
              type="button"
              onClick={() => setShowPitchModal(false)}
              style={{
                position: 'absolute',
                top: '1.25rem',
                right: '1.25rem',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-muted)',
                padding: '0.25rem'
              }}
              aria-label="Close presentation modal"
            >
              <X size={22} />
            </button>

            {/* Pitch Header */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.2rem 0.6rem',
                borderRadius: '999px',
                backgroundColor: 'var(--primary-light)',
                color: 'var(--primary)',
                fontSize: '0.75rem',
                fontWeight: 800,
                marginBottom: '0.5rem'
              }}>
                <Zap size={13} fill="currentColor" />
                <span>50-Second Hackathon Demo Mode</span>
              </div>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em', margin: 0 }}>
                LockNBook: High-Contention Reservation Architecture
              </h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                Quick reference guide for presenting our Domain 9 seat-locking engine to judges.
              </p>
            </div>

            {/* 3 Core Talking Points for Judges */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1rem',
              marginBottom: '1.75rem'
            }}>
              <div style={{ padding: '1rem', backgroundColor: '#F8FAFC', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#DC2626', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                  1. The Contention Challenge
                </div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                  When thousands of users click the same sleeper berth simultaneously, traditional SQL row-locking causes timeouts, race conditions, and accidental double-booking.
                </div>
              </div>

              <div style={{ padding: '1rem', backgroundColor: '#F8FAFC', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                  2. Two-Tiered Solution
                </div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                  Sub-millisecond Redis distributed locks for immediate 150s reservation holds + PostgreSQL for durable PNR vouchers, eliminating database bottlenecks.
                </div>
              </div>

              <div style={{ padding: '1rem', backgroundColor: '#F8FAFC', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#16A34A', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                  3. Verified Correctness
                </div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                  72-berth Indian Railways SL coach layout tested with 10/10 Python and Node.js unit tests confirming zero seat leakage, range validation, and automatic TTL release.
                </div>
              </div>
            </div>

            {/* Step-by-Step Flow Presentation */}
            <div style={{
              padding: '1.25rem',
              backgroundColor: '#EFF6FF',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--primary-border)',
              marginBottom: '1.5rem'
            }}>
              <div style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <Activity size={16} />
                <span>End-to-End Request Flow (Live Execution Walkthrough)</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                {flowSteps.map((step, idx) => (
                  <div
                    key={step.id}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.75rem',
                      padding: '0.5rem 0.75rem',
                      backgroundColor: '#FFFFFF',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-light)',
                      fontSize: '0.8125rem'
                    }}
                  >
                    <span style={{
                      fontWeight: 800,
                      color: 'var(--primary)',
                      backgroundColor: 'var(--primary-light)',
                      padding: '0.1rem 0.4rem',
                      borderRadius: '4px',
                      flexShrink: 0
                    }}>
                      {idx + 1}
                    </span>
                    <div style={{ flex: 1 }}>
                      <strong style={{ color: 'var(--text-main)', display: 'block' }}>{step.title}</strong>
                      <span style={{ color: 'var(--text-secondary)' }}>{step.detail}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pitch Modal Footer */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
              borderTop: '1px solid var(--border-light)',
              paddingTop: '1rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Target Coach: Indian Railways Sleeper (SL) &bull; 72 Berths &bull; 9 Bays
                </span>
                <a
                  href="https://github.com/TejasLolge/LockNBook"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: 'var(--primary)',
                    textDecoration: 'underline'
                  }}
                >
                  <Github size={13} />
                  <span>github.com/TejasLolge/LockNBook</span>
                  <ExternalLink size={11} />
                </a>
              </div>
              <button
                type="button"
                onClick={() => setShowPitchModal(false)}
                className="btn btn-primary btn-sm"
              >
                Close Technical Demo
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
