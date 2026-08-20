import kagglehub
import os
import pandas as pd

print("[INFO] Baixando dataset Kaggle 'prasad22/healthcare-dataset'...")
path = kagglehub.dataset_download("prasad22/healthcare-dataset")
print("Path to dataset files:", path)

files_found = []
for root, dirs, files in os.walk(path):
    for f in files:
        full_path = os.path.join(root, f)
        files_found.append(full_path)
        print("Dataset file:", full_path)

        if f.endswith('.csv'):
            df = pd.read_csv(full_path)
            print("\n--- RESUMO DO DATASET HEALTHCARE ---")
            print("Linhas:", len(df))
            print("Colunas:", list(df.columns))
            print("\nPrimeiras 3 linhas:")
            print(df.head(3))
