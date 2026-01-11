import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go

# Set page config
st.set_page_config(
    page_title="Virat Kohli Score Analytics",
    page_icon="🏏",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS for better look
st.markdown("""
<style>
    .main-header {
        font-size: 3rem;
        color: #1f77b4;
        text-align: center;
        margin-bottom: 2rem;
    }
    .metric-card {
        background-color: #f0f2f6;
        padding: 1rem;
        border-radius: 0.5rem;
        text-align: center;
    }
    .metric-value {
        font-size: 2rem;
        font-weight: bold;
        color: #1f77b4;
    }
    .metric-label {
        font-size: 1rem;
        color: #666;
    }
</style>
""", unsafe_allow_html=True)

# Load data
@st.cache_data
def load_data():
    df = pd.read_csv('Sources/Source.csv')
    df['date'] = pd.to_datetime(df['date'], format='%d%b%Y')
    df['year'] = df['date'].dt.year
    return df

df = load_data()

# Title
st.markdown('<h1 class="main-header">🏏 Virat Kohli Score Analytics Dashboard</h1>', unsafe_allow_html=True)

# Sidebar for navigation
st.sidebar.title("Navigation")
page = st.sidebar.radio("Go to", ["Overview", "Visualizations", "Q&A Assistant"])

if page == "Overview":
    st.header("Overview")
    
    # Key metrics
    col1, col2, col3, col4 = st.columns(4)
    
    with col1:
        st.markdown('<div class="metric-card"><div class="metric-value">{}</div><div class="metric-label">Total Matches</div></div>'.format(len(df)), unsafe_allow_html=True)
    
    with col2:
        st.markdown('<div class="metric-card"><div class="metric-value">{}</div><div class="metric-label">Total Runs</div></div>'.format(df['runs'].sum()), unsafe_allow_html=True)
    
    with col3:
        st.markdown('<div class="metric-card"><div class="metric-value">{:.2f}</div><div class="metric-label">Average Runs</div></div>'.format(df['runs'].mean()), unsafe_allow_html=True)
    
    with col4:
        st.markdown('<div class="metric-card"><div class="metric-value">{}</div><div class="metric-label">Highest Score</div></div>'.format(df['runs'].max()), unsafe_allow_html=True)
    
    # Centuries and fifties
    centuries = len(df[df['runs'] >= 100])
    fifties = len(df[(df['runs'] >= 50) & (df['runs'] < 100)])
    
    col5, col6 = st.columns(2)
    with col5:
        st.markdown('<div class="metric-card"><div class="metric-value">{}</div><div class="metric-label">Centuries</div></div>'.format(centuries), unsafe_allow_html=True)
    
    with col6:
        st.markdown('<div class="metric-card"><div class="metric-value">{}</div><div class="metric-label">Fifties</div></div>'.format(fifties), unsafe_allow_html=True)

elif page == "Visualizations":
    st.header("Visualizations")
    
    # Runs over time
    st.subheader("Runs Scored Over Time")
    fig = px.line(df, x='date', y='runs', title='Runs per Match Over Time')
    st.plotly_chart(fig, use_container_width=True)
    
    # Runs by opponent
    st.subheader("Runs by Opponent")
    opponent_runs = df.groupby('opponent')['runs'].sum().sort_values(ascending=False)
    fig = px.bar(opponent_runs, x=opponent_runs.index, y=opponent_runs.values, title='Total Runs by Opponent')
    st.plotly_chart(fig, use_container_width=True)
    
    # Runs by match type
    st.subheader("Runs by Match Type")
    match_runs = df.groupby('match')['runs'].sum()
    fig = px.pie(match_runs, values=match_runs.values, names=match_runs.index, title='Runs Distribution by Match Type')
    st.plotly_chart(fig, use_container_width=True)
    
    # Year-wise performance
    st.subheader("Year-wise Performance")
    year_runs = df.groupby('year')['runs'].sum()
    fig = px.bar(year_runs, x=year_runs.index, y=year_runs.values, title='Total Runs by Year')
    st.plotly_chart(fig, use_container_width=True)

elif page == "Q&A Assistant":
    st.header("Q&A Assistant")
    st.write("Ask questions about Virat Kohli's performance data!")
    
    # Simple Q&A logic
    question = st.text_input("Enter your question:")
    
    if st.button("Ask"):
        if question:
            question_lower = question.lower()
            answer = ""
            
            if "total runs" in question_lower or "sum of runs" in question_lower:
                answer = f"Total runs scored: {df['runs'].sum()}"
            elif "average runs" in question_lower or "mean runs" in question_lower:
                answer = f"Average runs per match: {df['runs'].mean():.2f}"
            elif "highest score" in question_lower or "maximum runs" in question_lower:
                answer = f"Highest score: {df['runs'].max()}"
            elif "centuries" in question_lower:
                centuries = len(df[df['runs'] >= 100])
                answer = f"Number of centuries: {centuries}"
            elif "fifties" in question_lower:
                fifties = len(df[(df['runs'] >= 50) & (df['runs'] < 100)])
                answer = f"Number of fifties: {fifties}"
            elif "matches" in question_lower and "total" in question_lower:
                answer = f"Total matches played: {len(df)}"
            elif "opponent" in question_lower and "most runs" in question_lower:
                opp = df.groupby('opponent')['runs'].sum().idxmax()
                runs = df.groupby('opponent')['runs'].sum().max()
                answer = f"Most runs against {opp}: {runs}"
            elif "year" in question_lower and "most runs" in question_lower:
                yr = df.groupby('year')['runs'].sum().idxmax()
                runs = df.groupby('year')['runs'].sum().max()
                answer = f"Most runs in {yr}: {runs}"
            else:
                answer = "Sorry, I can answer questions about total runs, average runs, highest score, centuries, fifties, total matches, most runs against an opponent, or most runs in a year. Please rephrase your question."
            
            st.success("Answer:")
            st.write(answer)
        else:
            st.warning("Please enter a question.")

# Footer
st.markdown("---")
st.markdown("Dashboard created with Streamlit | Data source: Virat Kohli Score Analytics")