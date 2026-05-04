export type DocumentMetaFile = { name: string; size: number; type: string } | null;

export type AdmissionDocumentMeta = {
  birthCertificate?: DocumentMetaFile;
  schoolReportCard?: DocumentMetaFile;
  passportPhotos?: DocumentMetaFile[];
  parentID?: DocumentMetaFile;
  proofOfResidence?: DocumentMetaFile;
  medicalCertificate?: DocumentMetaFile;
};

export function documentMetaToFlags(meta: unknown): {
  birthCertificate: boolean;
  schoolReportCard: boolean;
  passportPhotos: boolean;
  parentID: boolean;
  proofOfResidence: boolean;
  medicalCertificate: boolean;
} {
  const m = meta as AdmissionDocumentMeta | null | undefined;
  const photos = m?.passportPhotos;
  const hasPhotos = Array.isArray(photos) && photos.length > 0;

  return {
    birthCertificate: Boolean(m?.birthCertificate?.name),
    schoolReportCard: Boolean(m?.schoolReportCard?.name),
    passportPhotos: hasPhotos,
    parentID: Boolean(m?.parentID?.name),
    proofOfResidence: Boolean(m?.proofOfResidence?.name),
    medicalCertificate: Boolean(m?.medicalCertificate?.name),
  };
}
