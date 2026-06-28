"use client";

import { useState, useCallback } from "react";
import TaskCard from "@/components/task-card";
import { CheckCircle, Sparkles } from "lucide-react";

interface TaskItem {
  id: string;
  title: string;
  description: string | null;
  xpReward: number;
  coinReward: number;
  completedToday: boolean;
}

export default function TaskList({ tasks }: { tasks: TaskItem[] }) {
  const [completedCount, setCompletedCount] = useState(
    tasks.filter((t) => t.completedToday).length
  );

  const handleComplete = useCallback(() => {
    setCompletedCount((c) => c + 1);
  }, []);

  // Celebration when all tasks are done
  const allDone = completedCount >= tasks.length && tasks.length > 0;

  return (
    <div className="space-y-3">
      {/* Progress indicator */}
      <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
        <span>今日进度</span>
        <span className="font-medium">
          {completedCount}/{tasks.length}
        </span>
      </div>
      <div className="w-full bg-muted rounded-full h-2 mb-4">
        <div
          className="bg-gradient-to-r from-primary to-accent rounded-full h-2 transition-all duration-500"
          style={{ width: `${tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0}%` }}
        />
      </div>

      {/* All done celebration */}
      {allDone && (
        <div className="bg-success/10 border border-success/20 rounded-xl p-4 text-center animate-slide-up">
          <Sparkles className="w-8 h-8 text-success mx-auto mb-2" />
          <p className="font-bold text-success">太棒了！今天所有任务都完成啦！🎉</p>
        </div>
      )}

      {tasks.length > 0 ? (
        tasks.map((task) => (
          <TaskCard
            key={task.id}
            goalId={task.id}
            title={task.title}
            description={task.description}
            xpReward={task.xpReward}
            coinReward={task.coinReward}
            completedToday={task.completedToday}
            onComplete={handleComplete}
          />
        ))
      ) : (
        <div className="text-center py-12 bg-card rounded-xl border border-dashed border-border">
          <CheckCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">还没有任务哦</p>
          <p className="text-xs text-muted-foreground mt-1">让爸爸妈妈给你设几个目标吧！</p>
        </div>
      )}
    </div>
  );
}
