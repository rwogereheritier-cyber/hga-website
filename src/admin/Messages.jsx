import { useState } from 'react';
import { removeItem, updateItem, useStore } from '../lib/store';
import { toast } from '../lib/toast';
import { fmtDateTime } from './metrics';
import { AdminHeader, Btn, Details, Modal, Status, Table } from './ui';
import { td } from './styles';

export default function Messages() {
  const messages = useStore('messages');
  const [open, setOpen] = useState(null);
  const current = open && messages.find((m) => m.ref === open);

  function view(m) {
    if (m.status === 'New') updateItem('messages', 'ref', m.ref, { status: 'Read' });
    setOpen(m.ref);
  }

  return (
    <div className="flex flex-col gap-8">
      <AdminHeader title="Messages" sub="From the contact form" />
      <Table columns={[{ key: 'f', label: 'From' }, { key: 's', label: 'Subject' }, { key: 'd', label: 'Received' }, { key: 'st', label: 'Status' }, { key: 'x', label: '' }]} empty={messages.length ? null : 'No messages yet. Messages sent from the Contact page appear here.'}>
        {messages.map((m) => (
          <tr key={m.ref}>
            <td className={`${td} ${m.status === 'New' ? 'font-medium' : ''}`}>{m.name}</td>
            <td className={td}>{m.subject}</td>
            <td className={td}>{fmtDateTime(m.date)}</td>
            <td className={td}>
              <Status value={m.status} />
            </td>
            <td className={`${td} text-right`}>
              <button type="button" onClick={() => view(m)} className="font-medium text-burgundy">
                Open
              </button>
            </td>
          </tr>
        ))}
      </Table>
      {current && (
        <Modal
          title={current.subject}
          onClose={() => setOpen(null)}
          footer={
            <>
              <Btn
                variant="danger"
                className="mr-auto"
                onClick={() => {
                  removeItem('messages', 'ref', current.ref);
                  toast('Message deleted');
                  setOpen(null);
                }}
              >
                Delete
              </Btn>
              <a href={`mailto:${current.email}?subject=${encodeURIComponent(`Re: ${current.subject}`)}`} className="inline-flex h-10 items-center rounded-full bg-burgundy px-4 text-[14px] font-medium text-white">
                Reply by email
              </a>
            </>
          }
        >
          <Details rows={[['From', current.name], ['Email', current.email], ['Received', fmtDateTime(current.date)]]} />
          <p className="whitespace-pre-line rounded-md bg-grey-100 p-4 text-[15px] leading-[1.65]">{current.message}</p>
        </Modal>
      )}
    </div>
  );
}
