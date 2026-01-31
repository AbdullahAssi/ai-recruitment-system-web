"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { MessageSquarePlus, Loader2 } from "lucide-react";

interface FeedbackDialogProps {
  candidateId: string;
  jobId: string;
  currentScore: number;
  candidateName: string;
}

export function FeedbackDialog({
  candidateId,
  jobId,
  currentScore,
  candidateName,
}: FeedbackDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [feedbackType, setFeedbackType] = useState("SCORE_CORRECTION");
  const [correctedScore, setCorrectedScore] = useState(
    (currentScore * 100).toString(),
  );
  const [notes, setNotes] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        candidateId,
        jobId,
        feedbackType,
        aiPrediction: { score: currentScore },
        userCorrection: { score: parseFloat(correctedScore) / 100 },
        notes,
      };

      const res = await fetch("/api/v1/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("Failed to submit feedback");
      }

      toast.success("Feedback submitted successfully");
      setOpen(false);
    } catch (error) {
      console.error(error);
      toast.error("Error submitting feedback");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-primary"
        >
          <MessageSquarePlus className="w-4 h-4 mr-2" /> Feedback
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Provide Feedback</DialogTitle>
          <DialogDescription>
            Help improve AI accuracy for {candidateName}.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="type">Feedback Type</Label>
            <Select value={feedbackType} onValueChange={setFeedbackType}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SCORE_CORRECTION">
                  Score Correction
                </SelectItem>
                <SelectItem value="SKILL_MATCH_CORRECTION">
                  Skill Match Issue
                </SelectItem>
                <SelectItem value="STATUS_CORRECTION">Status Update</SelectItem>
                <SelectItem value="GENERAL">General Feedback</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="score">Corrected Score (%)</Label>
            <Input
              id="score"
              type="number"
              min="0"
              max="100"
              value={correctedScore}
              onChange={(e) => setCorrectedScore(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Why is the AI prediction incorrect?"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Submit Feedback
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
