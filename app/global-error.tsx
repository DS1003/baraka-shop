'use client'

import React from 'react'

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    return (
        <html lang="fr">
            <head>
                <title>Interruption temporaire | Baraka Shop</title>
                <meta name="viewport" content="width=device-width, initial-scale=1" />
            </head>
            <body
                style={{
                    margin: 0,
                    padding: '24px',
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#FAF7F2',
                    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                    color: '#1B1F3B',
                }}
            >
                <div
                    style={{
                        maxWidth: '480px',
                        width: '100%',
                        backgroundColor: '#FFFFFF',
                        borderRadius: '24px',
                        padding: '36px 28px',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.06)',
                        border: '1px solid #E2E8F0',
                        textAlign: 'center',
                    }}
                >
                    <div
                        style={{
                            width: '56px',
                            height: '56px',
                            borderRadius: '16px',
                            backgroundColor: 'rgba(232, 98, 26, 0.1)',
                            color: '#E8621A',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '28px',
                            margin: '0 auto 16px',
                            fontWeight: 'bold',
                        }}
                    >
                        !
                    </div>

                    <h1
                        style={{
                            fontSize: '22px',
                            fontWeight: '900',
                            textTransform: 'uppercase',
                            letterSpacing: '-0.5px',
                            margin: '0 0 10px',
                            color: '#1B1F3B',
                        }}
                    >
                        Baraka <span style={{ color: '#E8621A' }}>Shop</span>
                    </h1>

                    <p
                        style={{
                            fontSize: '13px',
                            color: '#64748B',
                            lineHeight: '1.6',
                            margin: '0 0 24px',
                        }}
                    >
                        Une opération de maintenance ou un rétablissement de connexion est en cours.
                        Veuillez cliquer ci-dessous pour rafraîchir la page.
                    </p>

                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                        <button
                            onClick={() => reset()}
                            style={{
                                padding: '12px 24px',
                                borderRadius: '12px',
                                backgroundColor: '#E8621A',
                                color: '#FFFFFF',
                                border: 'none',
                                fontWeight: '800',
                                fontSize: '12px',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px',
                                cursor: 'pointer',
                            }}
                        >
                            Réessayer
                        </button>

                        <button
                            onClick={() => { window.location.href = '/' }}
                            style={{
                                padding: '12px 24px',
                                borderRadius: '12px',
                                backgroundColor: '#1B1F3B',
                                color: '#FFFFFF',
                                border: 'none',
                                fontWeight: '800',
                                fontSize: '12px',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px',
                                cursor: 'pointer',
                            }}
                        >
                            Accueil
                        </button>
                    </div>

                    {error?.digest && (
                        <p
                            style={{
                                fontSize: '10px',
                                color: '#94A3B8',
                                marginTop: '20px',
                                fontFamily: 'monospace',
                            }}
                        >
                            Incident : {error.digest}
                        </p>
                    )}
                </div>
            </body>
        </html>
    )
}
