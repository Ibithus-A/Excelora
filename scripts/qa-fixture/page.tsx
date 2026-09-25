import {StudentActivityPanel} from "@/components/student-activity-panel";
import {listNotionLessons} from "@/content/notion-lessons/registry";
import {NATIVE_DUPLICATES} from "@/content/notion-lessons/native-duplicates";
import {notFound} from 'next/navigation';
import {GeneratedChapterAssessment} from '@/components/generated-chapter-assessment';
import {PracticeQuestions} from '@/components/practice-questions';
import {StructuredNativeLesson} from '@/components/structured-native-lesson';
import {PROOF_STRUCTURE} from '@/content/notion-lessons/proof-structure';
export default async function Page({searchParams}:{searchParams:Promise<{mode?:string;subject?:string;chapter?:string;lesson?:string;subtopic?:string}>}) {
 if(process.env.EXCELORA_QA_FIXTURES!=='1')notFound();
 const params=await searchParams;
 const Legacy=listNotionLessons().find(l=>l.definition.id===params.lesson)?.Component;
 return <main className="mx-auto max-w-3xl bg-white p-4">{params.mode==='tutor'?<StudentActivityPanel students={[{id:'qa-student',name:'QA Student',email:'qa@example.invalid',role:'student',plan:'premium',taggedChapterTitle:null,customUnlockedChapterTitles:[]}]} studentId="qa-student"/>:params.mode==='practice'?<PracticeQuestions subjectTitle={params.subject??'Pure Mathematics'} chapterTitle={params.chapter??'Chapter 1: Algebra and Functions'} initialSubtopic={params.subtopic??''}/>:params.mode==='native'?(Legacy?<Legacy/>:<StructuredNativeLesson lesson={NATIVE_DUPLICATES.find(l=>l.id===params.lesson)??PROOF_STRUCTURE}/>):<GeneratedChapterAssessment subjectTitle={params.subject??'Pure Mathematics'} chapterTitle={params.chapter??'Chapter 1: Algebra and Functions'} role="student"/>}</main>;
}
