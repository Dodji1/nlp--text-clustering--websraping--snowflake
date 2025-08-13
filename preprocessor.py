import pandas as pd
import string

# ========= CLEAN =========
def cleanse(df: pd.DataFrame) -> pd.DataFrame:
    """
    Remove rows with missing values from the DataFrame.
    """
    if df.isnull().values.any():
        df = df.dropna()
    return df


# ========= TOKENIZE =========
def cleanse_and_tokenize(text: str) -> list[str]:
    """
    Lowercase, remove punctuation, and tokenize a given text.
    """
    if not isinstance(text, str):
        return []

    # 1. Mise en minuscules
    text = text.lower()
    
    # 2. Suppression de la ponctuation
    punctuation_table = str.maketrans('', '', string.punctuation)
    text_no_punct = text.translate(punctuation_table)
    
    # 3. Découpage en tokens
    tokens = text_no_punct.split()
    return tokens


# ========= PIPELINE USAGE =========
# Example: df is already obtained from previous ETL step
# df = cleanse(df)  # clean nulls
# df['tokens'] = df['description'].apply(cleanse_and_tokenize)
