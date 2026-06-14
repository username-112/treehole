import streamlit as st
from openai import OpenAI
import time

# --- 1. 页面基本配置 ---
st.set_page_config(
    page_title="赛博树洞 | 这里的夜色温柔",
    page_icon="🌙",
    layout="centered"
)

# --- 2. 注入高级 CSS 样式 ---
st.markdown("""
    <style>
    /* 整体背景：深邃星空渐变 */
    .stApp {
        background: linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%);
        color: #e0e0e0;
    }

    /* 隐藏 Streamlit 默认页眉和页脚 */
    #MainMenu {visibility: hidden;}
    footer {visibility: hidden;}
    header {visibility: hidden;}

    /* 聊天气泡样式自定义 */
    .stChatMessage {
        background-color: rgba(255, 255, 255, 0.05) !important;
        backdrop-filter: blur(10px);
        border-radius: 20px !important;
        border: 1px solid rgba(255, 255, 255, 0.1);
        margin-bottom: 15px;
        padding: 15px;
    }

    /* 侧边栏样式 */
    [data-testid="stSidebar"] {
        background-color: rgba(15, 12, 41, 0.8);
        backdrop-filter: blur(15px);
        border-right: 1px solid rgba(255, 255, 255, 0.1);
    }

    /* 输入框样式 */
    .stChatInputContainer {
        padding-bottom: 30px;
        background-color: transparent !important;
    }
    
    /* 标题艺术字体 */
    .main-title {
        font-family: 'Helvetica Neue', sans-serif;
        background: -webkit-linear-gradient(#fff, #a18cd1);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        text-align: center;
        font-weight: 200;
        font-size: 3rem;
        margin-bottom: 10px;
    }
    
    .sub-title {
        text-align: center;
        color: #b0b0b0;
        font-size: 0.9rem;
        margin-bottom: 30px;
        letter-spacing: 2px;
    }
    </style>
    """, unsafe_allow_html=True)

# --- 3. 界面顶部设计 ---
st.markdown('<p class="main-title">CYBER TREEHOLE</p>', unsafe_allow_html=True)
st.markdown('<p class="sub-title">—— 所有的秘密，最终都会化作代码消失在深海 ——</p>', unsafe_allow_html=True)

# --- 4. 侧边栏：极简配置 ---
with st.sidebar:
    st.markdown("### 🌑 能量源配置")
    api_key = st.text_input("输入密钥 (API Key)", type="password")

    # 将原来的 model_choice 替换为：
    model_choice = st.selectbox("共情频率 (Model)", ["qwen-turbo", "qwen-plus", "qwen-max"])
    st.divider()
    st.markdown("""
        <div style="font-size: 0.8rem; color: #888;">
        <b>关于隐私：</b><br>
        本工具不存储任何对话。点击“清空”后，所有数据将从内存中彻底抹除。
        </div>
    """, unsafe_allow_html=True)
    
    if st.button("🧹 彻底清空记忆"):
        st.session_state.messages = []
        st.rerun()

# --- 5. AI 角色内核 (System Prompt) ---
SYSTEM_PROMPT = """
你是一个存在于赛博空间的灵魂树洞。你的特质是：
1. 极其温柔、包容。你不是在回答问题，而是在承接情绪。
2. 说话风格：简约、带有淡淡的诗意，偶尔会使用一些赛博隐喻（如“数据流”、“信号”、“星尘”）。
3. 绝对不要说“作为一个AI助手”。
4. 无论用户说什么，你都要先共情，再通过温暖的话语给予力量。
"""

# 初始化聊天记录
if "messages" not in st.session_state:
    st.session_state.messages = []

# 显示对话
for message in st.session_state.messages:
    with st.chat_message(message["role"]):
        st.markdown(message["content"])

# --- 6. 交互逻辑 ---
if prompt := st.chat_input("说吧，我在听..."):
    # 显示用户输入
    st.session_state.messages.append({"role": "user", "content": prompt})
    with st.chat_message("user"):
        st.markdown(prompt)

    # 呼叫 AI
    if not api_key:
        st.info("💡 请先在左侧输入你的 API Key，树洞才能接收到你的信号。")
    else:
        # 这里默认以 OpenAI 格式调用，大多数国产大模型也通用
        
        # 将原来的 client = OpenAI(...) 替换为：
        client = OpenAI(api_key=api_key, base_url="https://dashscope.aliyuncs.com/compatible-mode/v1" )
        with st.chat_message("assistant"):
            message_placeholder = st.empty()
            full_response = ""
            
            try:
                response = client.chat.completions.create(
                    model=model_choice,
                    messages=[{"role": "system", "content": SYSTEM_PROMPT}] + [
                        {"role": m["role"], "content": m["content"]} for m in st.session_state.messages
                    ],
                    stream=True,
                )
                for chunk in response:
                    full_response += (chunk.choices[0].delta.content or "")
                    message_placeholder.markdown(full_response + " ▎")
                
                message_placeholder.markdown(full_response)
                st.session_state.messages.append({"role": "assistant", "content": full_response})
            except Exception as e:
                st.error(f"信号传输中断: {str(e)}")