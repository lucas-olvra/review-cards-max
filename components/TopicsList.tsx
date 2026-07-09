'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { deleteTopic } from '@/lib/actions/topics';
import { ConfirmSubmitButton } from '@/components/ConfirmSubmitButton';
import { buttonDangerClass, buttonSecondaryClass, cardClass } from '@/lib/ui';
import type { Topic } from '@/lib/types';

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
};

export function TopicsList({ topics }: { topics: Topic[] }) {
  return (
    <motion.div className="space-y-4" variants={container} initial="hidden" animate="show">
      {topics.map((topic) => (
        <motion.div
          key={topic.id}
          variants={item}
          className={`${cardClass} transition-shadow hover:shadow-indigo-950/30`}
        >
          <h3 className="text-lg font-semibold">{topic.name}</h3>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href={`/topics/${topic.id}`} className={buttonSecondaryClass}>
              Abrir
            </Link>
            <Link href={`/topics/${topic.id}/review`} className={buttonSecondaryClass}>
              Revisar
            </Link>
            <ConfirmSubmitButton
              action={deleteTopic.bind(null, topic.id)}
              confirmMessage="Tem certeza que deseja excluir este tópico?"
              className={buttonDangerClass}
            >
              Excluir
            </ConfirmSubmitButton>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
