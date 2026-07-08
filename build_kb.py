import os
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter

def create_knowledge_base():
    structure = {
        "backend/knowledge_base/guidelines": [
            "ACC_AHA_Guideline_Chest_Pain.pdf",
            "ACC_AHA_Prevention_Guideline.pdf",
            "ESC_Cardiovascular_Disease_Prevention.pdf",
            "ESC_Heart_Failure_Guideline.pdf",
            "ESC_Atrial_Fibrillation_Guideline.pdf"
        ],
        "backend/knowledge_base/diseases": [
            "Hypertension.pdf",
            "Coronary_Artery_Disease.pdf",
            "Myocardial_Infarction.pdf",
            "Heart_Failure.pdf",
            "Arrhythmia.pdf"
        ],
        "backend/knowledge_base/laboratory": [
            "CBC_Reference_Ranges.pdf",
            "Lipid_Profile_Guide.pdf",
            "Liver_Function_Test.pdf",
            "Kidney_Function_Test.pdf",
            "Thyroid_Profile.pdf",
            "Cardiac_Biomarkers.pdf"
        ],
        "backend/knowledge_base/medications": [
            "Cardiovascular_Medications.pdf",
            "Statins.pdf",
            "Antiplatelet_Drugs.pdf",
            "Anticoagulants.pdf"
        ],
        "backend/knowledge_base/patient_education": [
            "Heart_Healthy_Diet.pdf",
            "Exercise_Guidelines.pdf",
            "Lifestyle_Modification.pdf"
        ]
    }

    print("Creating directories and placeholder PDFs...")
    
    for folder, files in structure.items():
        os.makedirs(folder, exist_ok=True)
        for file_name in files:
            file_path = os.path.join(folder, file_name)
            
            c = canvas.Canvas(file_path, pagesize=letter)
            title = file_name.replace('_', ' ').replace('.pdf', '')
            c.setFont("Helvetica-Bold", 16)
            c.drawString(50, 750, title)
            c.setFont("Helvetica", 12)
            c.drawString(50, 720, "This is a placeholder document for the MediAssist AI RAG Pipeline.")
            c.save()
            print(f"Created: {file_path}")
            
    print("\nSuccess! Folder structure built at ./backend/knowledge_base/")

if __name__ == "__main__":
    create_knowledge_base()
