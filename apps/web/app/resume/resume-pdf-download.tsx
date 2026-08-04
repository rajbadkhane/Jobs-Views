"use client";

import { Document, Page, PDFDownloadLink, StyleSheet, Text, View } from "@react-pdf/renderer";
import { Download } from "lucide-react";
import type { ResumeDocumentInput } from "@career-os/shared";

export function ResumePdfDownload({ document }: { document: ResumeDocumentInput & { id: string } }) {
  return <PDFDownloadLink document={<ResumePdf input={document} />} fileName={`${safeName(document.name)}.pdf`} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-[var(--cos-primary)] px-4 text-sm font-bold text-white">{({ loading }) => <><Download size={15} />{loading ? "Generating..." : "Download PDF"}</>}</PDFDownloadLink>;
}

const styles=StyleSheet.create({page:{padding:38,fontFamily:"Helvetica",fontSize:9,color:"#172033",lineHeight:1.45},name:{fontSize:22,fontFamily:"Helvetica-Bold"},headline:{fontSize:11,color:"#0A3A7A",marginTop:4},contact:{fontSize:8,color:"#475569",marginTop:6},section:{marginTop:14},heading:{fontSize:9,fontFamily:"Helvetica-Bold",textTransform:"uppercase",borderBottomWidth:1,borderBottomColor:"#CBD5E1",paddingBottom:3,marginBottom:5},body:{fontSize:9,whiteSpace:"pre-wrap"}});
function ResumePdf({input}:{input:ResumeDocumentInput}){const content=normalize(input.content);return <Document title={input.name} author="Jobs View"><Page size="A4" style={styles.page}><Text style={styles.name}>{content.name}</Text><Text style={styles.headline}>{content.headline||content.role}</Text><Text style={styles.contact}>{content.contact}</Text>{input.section_order.map((section)=>{const body=text(content.raw[section]);return body?<View key={section} style={styles.section}><Text style={styles.heading}>{section}</Text><Text style={styles.body}>{body}</Text></View>:null})}</Page></Document>}
function normalize(raw:Record<string,unknown>){const contact=(raw.contact&&typeof raw.contact==="object"?raw.contact:{}) as Record<string,unknown>;return{raw,name:[contact.first_name,contact.last_name].filter(Boolean).join(" ")||"Your Name",headline:String(contact.headline??""),role:String(raw.target_role??""),contact:[contact.email,contact.phone,contact.location].filter(Boolean).join(" | ")}}
function text(value:unknown):string{if(typeof value==="string")return value;if(Array.isArray(value))return value.map((item)=>typeof item==="string"?item:typeof item==="object"&&item?Object.values(item).filter((entry)=>typeof entry==="string"||typeof entry==="number").join(" | "):String(item)).join("\n");return ""}
function safeName(value:string){return(value||"jobs-view-resume").replace(/[^a-z0-9-_]+/gi,"-").replace(/^-|-$/g,"").toLowerCase()}
