import React from 'react'

export interface WorldBankDocument {
    display_title: string;
    url: string;
    docdt?: string;
    count?: string[];
    repnb?: string;
    docty?: string;
    abstracts?: string;
    pdfurl?: string;
    lang?: string[];
    topic?: string[];
    [key: string]: unknown;
}

interface Props {
    docs: WorldBankDocument[]
}

const WorldBankDocList: React.FC<Props> = ({ docs }) => {
    if (!docs || docs.length === 0) {
        return <p>No documents found.</p>
    }

    return (
        <div style={{ marginTop: '1rem' }}>
            {docs.map((doc, idx) => {

                const dateStr = doc.docdt ? doc.docdt.slice(0, 10) : 'N/A'

                let abstractText = ''
                if (typeof doc.abstracts === 'object' && doc.abstracts['cdata!']) {
                    abstractText = doc.abstracts['cdata!']
                } else if (typeof doc.abstracts === 'string') {
                    abstractText = doc.abstracts
                }

                const shortAbs = abstractText?.length > 200
                    ? abstractText.slice(0, 200) + '...'
                    : abstractText

                return (
                    <div
                        key={idx}
                        style={{ border: '1px solid #ccc', padding: '8px', marginBottom: '8px' }}
                    >
                        <h3>{doc.display_title ?? 'No Title'}</h3>
                        <div style={{ fontSize: '0.9rem', color: '#555' }}>
                            {dateStr} | {doc.count ? doc.count : 'No Country?'}
                        </div>
                        <p style={{ marginTop: '0.5rem' }}>{shortAbs}</p>
                        {doc.url && (
                            <a href={doc.url} target="_blank" rel="noreferrer">
                                Open Document
                            </a>
                        )}
                    </div>
                )
            })}
        </div>
    )
}

export default WorldBankDocList
